// src/app/api/inscription/route.ts
// Fichier complet : limite de 5 inscriptions par IP toutes les 60 minutes,
// et message générique qui ne confirme plus explicitement qu'un compte existe déjà.

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { inscriptionSchema } from "@/lib/validation";
import { verifierLimiteDebit, getIpClient } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const ip = getIpClient(request);
  const autorise = await verifierLimiteDebit(`inscription:${ip}`, 5, 60);
  if (!autorise) {
    return NextResponse.json({ erreur: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
  }

  const body = await request.json();
  const resultat = inscriptionSchema.safeParse(body);

  if (!resultat.success) {
    return NextResponse.json({ erreur: resultat.error.issues[0].message }, { status: 400 });
  }

  const { nom, email, telephone, password } = resultat.data;

  const existant = await prisma.user.findFirst({
    where: { OR: [{ email }, { telephone }] },
  });
  if (existant) {
    // Message volontairement générique — ne confirme pas explicitement qu'un
    // compte existe déjà avec cet e-mail précis (évite l'énumération de comptes).
    return NextResponse.json(
      { erreur: "Impossible de créer ce compte avec ces informations. Vérifiez vos données ou connectez-vous." },
      { status: 409 }
    );
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { nom, email, telephone, password: hash },
  });

  return NextResponse.json({ id: user.id, nom: user.nom, email: user.email });
}