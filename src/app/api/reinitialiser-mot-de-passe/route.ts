// src/app/api/reinitialiser-mot-de-passe/route.ts
// Vérifie que le jeton existe, n'est pas expiré, et n'a pas déjà été utilisé,
// puis met à jour le mot de passe et marque le jeton comme utilisé.

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { motDePasseSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const { token, nouveauMotDePasse } = await request.json();

  if (!token || !nouveauMotDePasse) {
    return NextResponse.json({ erreur: "Champs manquants" }, { status: 400 });
  }

  const resultat = motDePasseSchema.safeParse(nouveauMotDePasse);
  if (!resultat.success) {
    return NextResponse.json({ erreur: resultat.error.issues[0].message }, { status: 400 });
  }

  const jeton = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!jeton || jeton.utilise || jeton.expiresAt < new Date()) {
    return NextResponse.json({ erreur: "Ce lien est invalide ou a expiré. Demandez-en un nouveau." }, { status: 400 });
  }

  const nouveauHash = await bcrypt.hash(resultat.data, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: jeton.userId }, data: { password: nouveauHash, versionSession: { increment: 1 } } }),
    prisma.passwordResetToken.update({ where: { id: jeton.id }, data: { utilise: true } }),
  ]);

  return NextResponse.json({ ok: true });
}