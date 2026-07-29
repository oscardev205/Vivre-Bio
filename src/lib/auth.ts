// src/lib/auth.ts
// Configuration centrale de NextAuth : connexion par e-mail/téléphone + mot de passe.

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // sessions légères, pas besoin de table Session en base
  pages: {
    signIn: "/connexion",
  },
  providers: [
    CredentialsProvider({
      name: "Identifiants",
      credentials: {
        email: { label: "E-mail", type: "text" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const motDePasseValide = await bcrypt.compare(credentials.password, user.password);
        if (!motDePasseValide) return null;

        return { id: user.id, name: user.nom, email: user.email };
      },
    }),
  ],
  callbacks: {
    // On ajoute l'id utilisateur dans la session pour pouvoir l'utiliser dans les commandes
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as { id?: string }).id = token.id as string;
      return session;
    },
  },
};