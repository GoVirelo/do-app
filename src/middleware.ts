import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAuthRoute = nextUrl.pathname.startsWith("/login");
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isWebhook = nextUrl.pathname.startsWith("/api/webhooks");

  // Always allow auth routes and webhooks
  if (isAuthRoute || isApiAuthRoute || isWebhook) return NextResponse.next();

  // API routes return 401 if not logged in
  if (nextUrl.pathname.startsWith("/api/") && !isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Redirect unauthenticated users to /login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};
