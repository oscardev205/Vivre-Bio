// src/app/api/inscription/route.ts
// Fichier complet : accepte désormais codeParrain, vérifie qu'il correspond
// à un vrai compte, et lie le nouveau compte à ce parrain — silencieusement
// ignoré si le code est invalide (on ne bloque jamais une inscription pour
// un code de parrainage incorrect).

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
  const codeParrain = typeof body.codeParrain === "string" ? body.codeParrain.trim().toUpperCase() : undefined;

  const existant = await prisma.user.findFirst({
    where: { OR: [{ email }, { telephone }] },
  });
  if (existant) {
    return NextResponse.json(
      { erreur: "Impossible de créer ce compte avec ces informations. Vérifiez vos données ou connectez-vous." },
      { status: 409 }
    );
  }

  let parrainId: string | undefined;
  if (codeParrain) {
    const parrain = await prisma.user.findUnique({ where: { codeParrainage: codeParrain } });
    if (parrain) parrainId = parrain.id; // ignoré silencieusement si code inconnu
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { nom, email, telephone, password: hash, parrainId },
  });

  return NextResponse.json({ id: user.id, nom: user.nom, email: user.email });
}