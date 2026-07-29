// src/app/api/inscription/route.ts
// Route API appelée par le formulaire d'inscription : valide, hash le mot de passe, crée le compte.

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { inscriptionSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json();
  const resultat = inscriptionSchema.safeParse(body);

  if (!resultat.success) {
    return NextResponse.json(
      { erreur: resultat.error.issues[0].message },
      { status: 400 }
    );
  }

  const { nom, email, telephone, password } = resultat.data;

  const existant = await prisma.user.findFirst({
    where: { OR: [{ email }, { telephone }] },
  });
  if (existant) {
    return NextResponse.json(
      { erreur: "Un compte existe déjà avec cet e-mail ou ce téléphone" },
      { status: 409 }
    );
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { nom, email, telephone, password: hash },
  });

  return NextResponse.json({ id: user.id, nom: user.nom, email: user.email });
}