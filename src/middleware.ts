// src/middleware.ts
// Protège /compte/* (tout utilisateur connecté) et /admin/* (uniquement rôle ADMIN).
// Un client connecté qui tente d'accéder à /admin est renvoyé vers l'accueil.

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = (req.nextauth.token as { role?: string } | null)?.role;

    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: "/connexion" },
  }
);

export const config = {
  matcher: ["/compte/:path*", "/admin/:path*"],
};