// src/app/api/contact/route.ts
// Utilise désormais envoyerMessageContact() (template admin détourné) au lieu
// d'un template dédié qui dépasserait la limite gratuite d'EmailJS.

import { NextResponse } from "next/server";
import { envoyerMessageContact } from "@/lib/email";

export async function POST(request: Request) {
  const { nom, email, message } = await request.json();

  if (!nom || !email || !message) {
    return NextResponse.json({ erreur: "Champs manquants" }, { status: 400 });
  }

  await envoyerMessageContact({ nom, email, message });
  return NextResponse.json({ ok: true });
}