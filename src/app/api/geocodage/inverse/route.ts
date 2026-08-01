// src/app/api/geocodage/inverse/route.ts
// Ajout : "adresseCourte" (juste la rue/le repère), distincte du nom complet,
// pour éviter la duplication avec ville/quartier affichés séparément.

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ erreur: "Coordonnées manquantes" }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", lat);
  url.searchParams.set("lon", lng);
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url, {
    headers: { "User-Agent": "VivreBio-Site/1.0 (contact via le formulaire du site)" },
  });

  if (!res.ok) {
    return NextResponse.json({ erreur: "Service de géocodage indisponible" }, { status: 502 });
  }

  const data = await res.json();
  const a = data.address ?? {};

  // Adresse courte : rue + numéro si dispo, sinon repère le plus précis, sinon
  // le premier segment du nom complet — jamais toute la chaîne verbeuse.
  const adresseCourte =
    [a.road, a.house_number].filter(Boolean).join(" ") ||
    a.neighbourhood ||
    a.suburb ||
    (data.display_name ? data.display_name.split(",")[0] : "") ||
    "";

  return NextResponse.json({
    adresseTexte: data.display_name ?? null,
    adresseCourte,
    ville: a.city ?? a.town ?? a.municipality ?? a.county ?? "",
    quartier: a.suburb ?? a.neighbourhood ?? a.quarter ?? a.residential ?? "",
  });
}