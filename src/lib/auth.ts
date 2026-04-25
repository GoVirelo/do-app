import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Slack from "next-auth/providers/slack";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { verifyTOTP } from "@/lib/totp";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  totpCode: z.string().optional(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    MicrosoftEntraID({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID ?? "common"}/v2.0`,
      authorization: {
        params: {
          scope:
            "openid profile email offline_access Mail.Read Calendars.Read Tasks.ReadWrite",
          redirect_uri: `${process.env.AUTH_URL ?? process.env.NEXTAUTH_URL}/api/auth/callback/microsoft-entra-id`,
        },
      },
    }),
    Slack({
      clientId: process.env.SLACK_CLIENT_ID!,
      clientSecret: process.env.SLACK_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid profile email",
          user_scope: "im:history",
        },
      },
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password, totpCode } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) return null;

        if (user.totpEnabled && user.totpSecret) {
          if (!totpCode) return null;
          const valid = await verifyTOTP(totpCode, user.totpSecret);
          if (!valid) return null;
        }

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) token.userId = user.id;
      // Store OAuth tokens for service calls
      if (account?.provider === "microsoft-entra-id") {
        token.microsoftAccessToken = account.access_token;
        token.microsoftRefreshToken = account.refresh_token;
        token.microsoftExpiresAt = account.expires_at;
      }
      if (account?.provider === "slack") {
        token.slackAccessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId as string;
      return session;
    },
    async signIn({ account, profile }) {
      // Persist OAuth tokens to Integration table on sign-in
      if (account && profile?.email) {
        const user = await prisma.user.findUnique({
          where: { email: profile.email as string },
        });
        if (user && (account.provider === "microsoft-entra-id" || account.provider === "slack")) {
          const provider =
            account.provider === "microsoft-entra-id" ? "outlook" : "slack";
          // For Slack OAuth v2, user-level token is in authed_user, not the top-level access_token
          const slackUserToken = (account as any).authed_user?.access_token;
          const accessToken =
            provider === "slack" ? (slackUserToken ?? account.access_token ?? "") : (account.access_token ?? "");
          await prisma.integration.upsert({
            where: { userId_provider: { userId: user.id, provider } },
            create: {
              userId: user.id,
              provider,
              accessToken,
              refreshToken: account.refresh_token,
              expiresAt: account.expires_at
                ? new Date(account.expires_at * 1000)
                : undefined,
              scope: account.scope,
            },
            update: {
              accessToken,
              refreshToken: account.refresh_token,
              expiresAt: account.expires_at
                ? new Date(account.expires_at * 1000)
                : undefined,
              scope: account.scope,
            },
          });
        }
      }
      return true;
    },
  },
});
