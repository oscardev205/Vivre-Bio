// src/lib/auth.ts
// Fichier complet : ajout d'une limite de 5 tentatives échouées par e-mail
// toutes les 15 minutes, vérifiée AVANT même de comparer le mot de passe.

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifierLimiteDebit } from "@/lib/rateLimit";

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

        const email = credentials.email.toLowerCase().trim();
        const cle = `login:${email}`;

        const autorise = await verifierLimiteDebit(cle, 5, 15);
        if (!autorise) {
          throw new Error("Trop de tentatives — réessayez dans 15 minutes.");
        }

        const user = await prisma.user.findUnique({ where: { email } });
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