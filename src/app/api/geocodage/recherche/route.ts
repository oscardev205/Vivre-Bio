// src/app/api/geocodage/recherche/route.ts
// Même logique côté recherche : on garde display_name pour l'aperçu, mais on
// dérive aussi une adresse courte par résultat côté client (AddressMapPicker).

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.trim().length < 3) {
    return NextResponse.json({ erreur: "Recherche trop courte" }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", q);
  url.searchParams.set("countrycodes", "bj");
  url.searchParams.set("limit", "5");
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url, {
    headers: { "User-Agent": "VivreBio-Site/1.0 (contact via le formulaire du site)" },
  });

  if (!res.ok) {
    return NextResponse.json({ erreur: "Service de recherche indisponible" }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}