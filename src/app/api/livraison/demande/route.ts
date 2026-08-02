// src/app/api/livraison/demande/route.ts
// Fichier complet : limite de 5 demandes de zone par IP toutes les 60 minutes.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { envoyerDemandeLivraisonAdmin } from "@/lib/email";
import { verifierLimiteDebit, getIpClient } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const ip = getIpClient(request);
  const autorise = await verifierLimiteDebit(`demande-livraison:${ip}`, 5, 60);
  if (!autorise) {
    return NextResponse.json({ erreur: "Trop de demandes envoyées. Réessayez plus tard." }, { status: 429 });
  }

  const { ville, nom, telephone, email } = await request.json();

  if (!ville || !nom || !telephone) {
    return NextResponse.json({ erreur: "Champs manquants" }, { status: 400 });
  }

  const demande = await prisma.deliveryRequest.create({
    data: { ville: ville.trim(), nom: nom.trim(), telephone: telephone.trim(), email: email?.trim() || null },
  });

  await envoyerDemandeLivraisonAdmin({ ville: demande.ville, nom: demande.nom, telephone: demande.telephone });

  return NextResponse.json({ ok: true });
}