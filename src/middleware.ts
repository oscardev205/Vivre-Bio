// src/middleware.ts
// Fichier complet : ajout de la protection /livreur (rôle LIVREUR requis),
// en plus de ce qui existait déjà pour /compte et /admin.

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = (req.nextauth.token as { role?: string } | null)?.role;

    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (pathname.startsWith("/livreur") && role !== "LIVREUR") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token?.id,
    },
    pages: { signIn: "/connexion" },
  }
);

export const config = {
  matcher: ["/compte/:path*", "/admin/:path*", "/livreur/:path*"],
};