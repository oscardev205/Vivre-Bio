// src/lib/auth.ts
// Ajout : le téléphone de l'utilisateur est désormais inclus dans la session,
// pour pouvoir pré-remplir les formulaires sans jamais le redemander.

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/connexion" },
  providers: [
    CredentialsProvider({
      name: "Identifiants",
      credentials: {
        email: { label: "E-mail", type: "text" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.password) return null;

        const motDePasseValide = await bcrypt.compare(credentials.password, user.password);
        if (!motDePasseValide) return null;

        return { id: user.id, name: user.nom, email: user.email, role: user.role, telephone: user.telephone };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: string }).role;
        token.telephone = (user as unknown as { telephone?: string | null }).telephone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; role?: string; telephone?: string | null }).id = token.id as string;
        (session.user as { id?: string; role?: string; telephone?: string | null }).role = token.role as string;
        (session.user as { id?: string; role?: string; telephone?: string | null }).telephone = token.telephone as string | null;
      }
      return session;
    },
  },
};