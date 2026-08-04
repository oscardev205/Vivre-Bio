// src/app/api/compte/mot-de-passe/route.ts
// Fichier complet : incrémente versionSession après le changement — toute
// session ouverte ailleurs (autre appareil/navigateur) sera invalidée au
// prochain chargement de page.

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { motDePasseSchema } from "@/lib/validation";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });

  const { ancienMotDePasse, nouveauMotDePasse } = await request.json();

  const resultat = motDePasseSchema.safeParse(nouveauMotDePasse);
  if (!resultat.success) {
    return NextResponse.json({ erreur: resultat.error.issues[0].message }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.password) {
    return NextResponse.json({ erreur: "Compte introuvable" }, { status: 404 });
  }

  const motDePasseValide = await bcrypt.compare(ancienMotDePasse ?? "", user.password);
  if (!motDePasseValide) {
    return NextResponse.json({ erreur: "Mot de passe actuel incorrect" }, { status: 400 });
  }

  const nouveauHash = await bcrypt.hash(resultat.data, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: nouveauHash, versionSession: { increment: 1 } },
  });

  return NextResponse.json({ ok: true });
}