import type { NextAuthConfig } from "next-auth";

// Lightweight config — safe for Edge Runtime (no Prisma, no bcryptjs)
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      if (pathname.startsWith("/login")) return true;
      if (pathname.startsWith("/api/auth")) return true;
      if (pathname.startsWith("/api/webhooks")) return true;

      if (!isLoggedIn && pathname.startsWith("/api/")) return false;
      if (!isLoggedIn) return false;

      return true;
    },
  },
};
