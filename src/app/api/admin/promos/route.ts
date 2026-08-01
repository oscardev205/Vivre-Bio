// src/app/api/admin/promos/route.ts
// Correction : la date d'expiration est enregistrée à 23h59 du jour choisi
// (et non minuit), pour que le code reste valide toute la journée sélectionnée.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });
  const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(promos);
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const body = await request.json();
  const promo = await prisma.promoCode.create({
    data: {
      code: body.code.toUpperCase().trim(),
      type: body.type,
      valeur: Number(body.valeur),
      // Ajoute l'heure de fin de journée plutôt que minuit — évite qu'une date
      // "aujourd'hui" soit considérée expirée dès sa création.
      dateExpiration: body.dateExpiration ? new Date(`${body.dateExpiration}T23:59:59`) : null,
      utilisationMax: body.utilisationMax ? Number(body.utilisationMax) : null,
      montantMinimum: body.montantMinimum ? Number(body.montantMinimum) : null,
    },
  });
  return NextResponse.json(promo);
}