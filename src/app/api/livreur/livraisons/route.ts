// src/app/api/livreur/livraisons/route.ts
// Liste UNIQUEMENT les commandes assignées au livreur connecté — jamais
// toutes les commandes du site.

import { NextResponse } from "next/server";
import { requireLivreur } from "@/lib/livreur";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireLivreur();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const livreurId = (session.user as { id: string }).id;

  const commandes = await prisma.order.findMany({
    where: { livreurId, modeLivraison: "LIVRAISON" },
    include: { items: true, address: true, user: { select: { nom: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(commandes);
}