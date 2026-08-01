// src/app/api/livraison/frais/route.ts
// Route publique — utilisée en direct pendant que le client tape/choisit sa ville,
// pour afficher le vrai tarif avant même de valider l'adresse.

import { NextResponse } from "next/server";
import { getFraisLivraison } from "@/lib/livraison";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ville = searchParams.get("ville");

  if (!ville || ville.trim().length < 2) {
    return NextResponse.json({ erreur: "Ville trop courte" }, { status: 400 });
  }

  const resultat = await getFraisLivraison(ville);
  return NextResponse.json(resultat);
}