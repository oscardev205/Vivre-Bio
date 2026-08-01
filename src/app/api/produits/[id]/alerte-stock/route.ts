// src/app/api/produits/[id]/alerte-stock/route.ts
// POST : enregistre un e-mail pour être notifié quand le produit sera de nouveau en stock.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { email } = await request.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ erreur: "E-mail invalide" }, { status: 400 });
  }

  try {
    await prisma.stockAlert.create({ data: { productId: id, email: email.toLowerCase().trim() } });
  } catch {
    // Déjà inscrit pour ce produit — pas grave, on répond succès quand même
  }

  return NextResponse.json({ ok: true });
}