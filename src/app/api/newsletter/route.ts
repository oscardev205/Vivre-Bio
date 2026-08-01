// src/app/api/newsletter/route.ts
// POST : inscrit un e-mail à la newsletter. Gère le cas "déjà inscrit" proprement
// (pas une erreur, juste une confirmation silencieuse).

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ erreur: "E-mail invalide" }, { status: 400 });
  }

  try {
    await prisma.newsletterSubscriber.create({ data: { email: email.toLowerCase().trim() } });
  } catch {
    // Déjà inscrit (contrainte unique) — on répond succès quand même,
    // pas la peine d'exposer cette info ni de traiter ça comme une erreur.
  }

  return NextResponse.json({ ok: true });
}