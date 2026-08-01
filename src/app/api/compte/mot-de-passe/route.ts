// src/app/api/compte/mot-de-passe/route.ts
// PATCH : vérifie l'ancien mot de passe avant d'enregistrer le nouveau (hashé).

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });

  const { ancienMotDePasse, nouveauMotDePasse } = await request.json();

  if (!nouveauMotDePasse || nouveauMotDePasse.length < 6) {
    return NextResponse.json({ erreur: "Le nouveau mot de passe doit contenir au moins 6 caractères" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.password) {
    return NextResponse.json({ erreur: "Compte introuvable" }, { status: 404 });
  }

  const motDePasseValide = await bcrypt.compare(ancienMotDePasse ?? "", user.password);
  if (!motDePasseValide) {
    return NextResponse.json({ erreur: "Mot de passe actuel incorrect" }, { status: 400 });
  }

  const nouveauHash = await bcrypt.hash(nouveauMotDePasse, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: nouveauHash } });

  return NextResponse.json({ ok: true });
}