// src/app/api/livraison/demande/route.ts
// Le client demande à être livré dans une ville non encore couverte.
// Notifie l'admin, qui pourra approuver (créant la zone) ou refuser depuis le back-office.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { envoyerDemandeLivraisonAdmin } from "@/lib/email";

export async function POST(request: Request) {
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