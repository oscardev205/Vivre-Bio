// src/app/api/contact/route.ts
// Fichier complet : limite de 5 messages par IP toutes les 60 minutes.

import { NextResponse } from "next/server";
import { envoyerMessageContact } from "@/lib/email";
import { verifierLimiteDebit, getIpClient } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const ip = getIpClient(request);
  const autorise = await verifierLimiteDebit(`contact:${ip}`, 5, 60);
  if (!autorise) {
    return NextResponse.json({ erreur: "Trop de messages envoyés. Réessayez plus tard." }, { status: 429 });
  }

  const { nom, email, message } = await request.json();

  if (!nom || !email || !message) {
    return NextResponse.json({ erreur: "Champs manquants" }, { status: 400 });
  }

  await envoyerMessageContact({ nom, email, message });
  return NextResponse.json({ ok: true });
}