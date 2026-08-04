// src/app/api/newsletter/route.ts
// Fichier complet : rejette silencieusement si honeypot rempli.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifierLimiteDebit, getIpClient } from "@/lib/rateLimit";
import { estUnBot } from "@/lib/honeypot";

export async function POST(request: Request) {
  const body = await request.json();

  if (estUnBot(body)) {
    return NextResponse.json({ ok: true });
  }

  const ip = getIpClient(request);
  const autorise = await verifierLimiteDebit(`newsletter:${ip}`, 5, 60);
  if (!autorise) {
    return NextResponse.json({ erreur: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
  }

  const { email } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ erreur: "E-mail invalide" }, { status: 400 });
  }

  try {
    await prisma.newsletterSubscriber.create({ data: { email: email.toLowerCase().trim() } });
  } catch {
    // Déjà inscrit — succès quand même
  }

  return NextResponse.json({ ok: true });
}