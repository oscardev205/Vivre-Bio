// src/app/api/parrainage/route.ts
// GET : renvoie le code du client connecté (le génère à la volée s'il n'en a
// pas encore, pour couvrir les comptes créés avant cette fonctionnalité).

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { genererCodeParrainageUnique } from "@/lib/parrainage";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });

  let utilisateur = await prisma.user.findUnique({ where: { id: userId } });

  if (!utilisateur?.codeParrainage) {
    const code = await genererCodeParrainageUnique();
    utilisateur = await prisma.user.update({ where: { id: userId }, data: { codeParrainage: code } });
  }

  return NextResponse.json({ code: utilisateur.codeParrainage });
}