// src/app/api/newsletter/route.ts
// Fichier complet : limite de 5 inscriptions newsletter par IP toutes les 60 minutes.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifierLimiteDebit, getIpClient } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const ip = getIpClient(request);
  const autorise = await verifierLimiteDebit(`newsletter:${ip}`, 5, 60);
  if (!autorise) {
    return NextResponse.json({ erreur: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
  }

  const { email } = await request.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ erreur: "E-mail invalide" }, { status: 400 });
  }

  try {
    await prisma.newsletterSubscriber.create({ data: { email: email.toLowerCase().trim() } });
  } catch {
    // Déjà inscrit — on répond succès quand même
  }

  return NextResponse.json({ ok: true });
}