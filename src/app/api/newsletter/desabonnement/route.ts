// src/app/api/newsletter/desabonnement/route.ts
// POST : retire un e-mail de la liste des abonnés. Répond toujours succès,
// même si l'e-mail n'était pas inscrit — pour ne jamais révéler si une adresse
// est ou non dans la base (bonne pratique de confidentialité).

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ erreur: "E-mail invalide" }, { status: 400 });
  }

  await prisma.newsletterSubscriber.deleteMany({
    where: { email: email.toLowerCase().trim() },
  });

  return NextResponse.json({ ok: true });
}