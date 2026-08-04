// src/app/api/contact/route.ts
// Fichier complet : rejette silencieusement si le honeypot est rempli.

import { NextResponse } from "next/server";
import { envoyerMessageContact } from "@/lib/email";
import { verifierLimiteDebit, getIpClient } from "@/lib/rateLimit";
import { estUnBot } from "@/lib/honeypot";

export async function POST(request: Request) {
  const body = await request.json();

  // Réponse identique à un succès normal — on ne révèle jamais à un bot qu'il
  // a été détecté, ça l'aiderait à s'adapter.
  if (estUnBot(body)) {
    return NextResponse.json({ ok: true });
  }

  const ip = getIpClient(request);
  const autorise = await verifierLimiteDebit(`contact:${ip}`, 5, 60);
  if (!autorise) {
    return NextResponse.json({ erreur: "Trop de messages envoyés. Réessayez plus tard." }, { status: 429 });
  }

  const { nom, email, message } = body;

  if (!nom || !email || !message) {
    return NextResponse.json({ erreur: "Champs manquants" }, { status: 400 });
  }

  await envoyerMessageContact({ nom, email, message });
  return NextResponse.json({ ok: true });
}