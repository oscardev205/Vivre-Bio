// src/app/api/parrainage/reinitialiser/route.ts
// Génère un nouveau code, remplace l'ancien. Les filleuls déjà liés le restent
// (le lien parrain-filleul est fixé à l'inscription, pas au code lui-même).

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { genererCodeParrainageUnique } from "@/lib/parrainage";

export async function POST() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });

  const nouveauCode = await genererCodeParrainageUnique();
  await prisma.user.update({ where: { id: userId }, data: { codeParrainage: nouveauCode } });

  return NextResponse.json({ code: nouveauCode });
}