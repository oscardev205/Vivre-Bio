// src/app/api/mot-de-passe-oublie/route.ts
// Génère un jeton de réinitialisation et envoie le lien par e-mail. Répond
// toujours succès, que l'e-mail existe ou non (anti-énumération de comptes),
// et limite le débit pour éviter le spam de cette route.

import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { envoyerLienReinitialisation } from "@/lib/email";
import { verifierLimiteDebit, getIpClient } from "@/lib/rateLimit";
import { SITE_URL } from "@/lib/seo";

export async function POST(request: Request) {
  const ip = getIpClient(request);
  const autorise = await verifierLimiteDebit(`mdp-oublie:${ip}`, 5, 60);
  if (!autorise) {
    return NextResponse.json({ erreur: "Trop de demandes. Réessayez plus tard." }, { status: 429 });
  }

  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ erreur: "E-mail requis" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

  // Toujours la même réponse, que le compte existe ou non — évite de révéler
  // quels e-mails sont inscrits sur le site.
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60_000); // 1 heure

    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    const lien = `${SITE_URL}/reinitialiser-mot-de-passe?token=${token}`;
    if (user.email) {
      await envoyerLienReinitialisation({ destinataire: user.email, lien });
    }
  }

  return NextResponse.json({ ok: true });
}