// src/lib/auth.ts
// Fichier complet : ajout de la vérification "actif" — un compte désactivé
// ne peut plus se connecter, même avec le bon mot de passe.

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
        if (!user.actif) {
          throw new Error("Ce compte a été désactivé. Contactez l'administrateur.");
        }

        const motDePasseValide = await bcrypt.compare(credentials.password, user.password);
        if (!motDePasseValide) return null;

        return {
          id: user.id,
          name: user.nom,
          email: user.email,
          role: user.role,
          telephone: user.telephone,
          versionSession: user.versionSession,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: string }).role;
        token.telephone = (user as unknown as { telephone?: string | null }).telephone;
        token.versionSession = (user as unknown as { versionSession: number }).versionSession;
      }

      if (token.id) {
        const utilisateurActuel = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { versionSession: true, actif: true },
        });

        if (!utilisateurActuel || !utilisateurActuel.actif || utilisateurActuel.versionSession !== token.versionSession) {
          return {};
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (!token.id) {
        return { ...session, user: undefined };
      }
      if (session.user) {
        (session.user as { id?: string; role?: string; telephone?: string | null }).id = token.id as string;
        (session.user as { id?: string; role?: string; telephone?: string | null }).role = token.role as string;
        (session.user as { id?: string; role?: string; telephone?: string | null }).telephone = token.telephone as string | null;
      }
      return session;
    },
  },
};