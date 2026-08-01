// src/app/api/promo/valider/route.ts
// Vérifie qu'un code promo est utilisable pour un sous-total donné, et calcule
// le montant de réduction — appelé depuis le panier ET revérifié à la commande.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
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
      : Math.min(promo.valeur, sousTotal); // jamais plus que le sous-total lui-même

  return NextResponse.json({
    code: promo.code,
    type: promo.type,
    valeur: promo.valeur,
    reduction,
  });
}