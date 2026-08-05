// src/app/api/livreur/livraisons/[numero]/statut/route.ts
// Le livreur marque une commande "Récupérée" (EXPEDIEE, déjà fait par l'admin
// en amont) ou "Livrée" — vérifie que la commande lui appartient bien avant
// toute modification.

import { NextResponse } from "next/server";
import { requireLivreur } from "@/lib/livreur";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ numero: string }> }
) {
  const session = await requireLivreur();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const { numero } = await params;
  const livreurId = (session.user as { id: string }).id;
  const { statut } = await request.json();

  if (statut !== "LIVREE") {
    return NextResponse.json({ erreur: "Statut invalide" }, { status: 400 });
  }

  const commande = await prisma.order.findUnique({ where: { numero } });
  if (!commande || commande.livreurId !== livreurId) {
    return NextResponse.json({ erreur: "Commande introuvable" }, { status: 404 });
  }
  if (commande.statut !== "EXPEDIEE") {
    return NextResponse.json({ erreur: "Cette commande n'est pas en cours de livraison" }, { status: 400 });
  }

  await prisma.order.update({
    where: { id: commande.id },
    data: { statut: "LIVREE", livraisonConfirmee: true, livraisonConfirmeeAt: new Date(), livraisonConfirmeePar: "LIVREUR" },
  });

  return NextResponse.json({ ok: true });
}