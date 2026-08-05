// src/app/api/admin/commandes/[numero]/assigner/route.ts
// Fichier complet : ne contient plus que PATCH (le GET des livreurs
// disponibles a été déplacé vers /api/admin/commandes/livreurs-disponibles).

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { envoyerNotificationAssignationLivreur } from "@/lib/email";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ numero: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const { numero } = await params;
  const { livreurId } = await request.json();

  const commande = await prisma.order.findUnique({ where: { numero } });
  if (!commande) return NextResponse.json({ erreur: "Commande introuvable" }, { status: 404 });
  if (commande.modeLivraison !== "LIVRAISON") {
    return NextResponse.json({ erreur: "Cette commande est en retrait — aucun livreur nécessaire" }, { status: 400 });
  }

  const livreur = await prisma.user.findUnique({ where: { id: livreurId } });
  if (!livreur || livreur.role !== "LIVREUR") {
    return NextResponse.json({ erreur: "Livreur invalide" }, { status: 400 });
  }

  await prisma.order.update({
    where: { id: commande.id },
    data: { livreurId, statut: "EXPEDIEE" },
  });

  if (livreur.email) {
    await envoyerNotificationAssignationLivreur({ destinataire: livreur.email, numero: commande.numero });
  }

  return NextResponse.json({ ok: true });
}