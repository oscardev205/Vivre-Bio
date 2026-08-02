// src/app/api/promo/valider/route.ts
// Fichier complet : limite de 20 essais de code promo par IP toutes les 15 minutes
// (empêche de tester des centaines de codes à la chaîne).

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifierLimiteDebit, getIpClient } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const ip = getIpClient(request);
  const autorise = await verifierLimiteDebit(`promo:${ip}`, 20, 15);
  if (!autorise) {
    return NextResponse.json({ erreur: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
  }

  const { code, sousTotal } = await request.json();

  if (!code) {
    return NextResponse.json({ erreur: "Code manquant" }, { status: 400 });
  }

  const promo = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase().trim() } });

  if (!promo || !promo.actif) {
    return NextResponse.json({ erreur: "Code promo invalide" }, { status: 404 });
  }
  if (promo.dateExpiration && promo.dateExpiration < new Date()) {
    return NextResponse.json({ erreur: "Ce code promo a expiré" }, { status: 400 });
  }
  if (promo.utilisationMax !== null && promo.nombreUtilisations >= promo.utilisationMax) {
    return NextResponse.json({ erreur: "Ce code promo a atteint sa limite d'utilisation" }, { status: 400 });
  }
  if (promo.montantMinimum && sousTotal < promo.montantMinimum) {
    return NextResponse.json(
      { erreur: `Ce code nécessite un panier d'au moins ${promo.montantMinimum.toLocaleString("fr-FR")} FCFA` },
      { status: 400 }
    );
  }

  const reduction =
    promo.type === "POURCENTAGE"
      ? Math.round((sousTotal * promo.valeur) / 100)
      : Math.min(promo.valeur, sousTotal);

  return NextResponse.json({
    code: promo.code,
    type: promo.type,
    valeur: promo.valeur,
    reduction,
  });
}