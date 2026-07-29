// src/app/api/auth/[...nextauth]/route.ts
// Point d'entrée obligatoire de NextAuth pour l'App Router.

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };