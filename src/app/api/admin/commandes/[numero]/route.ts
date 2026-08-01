// src/app/api/admin/commandes/[numero]/route.ts
// PATCH : change le statut d'une commande. Réservé aux admins.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ numero: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const { numero } = await params;
  const { statut } = await request.json();

  const commande = await prisma.order.update({ where: { numero }, data: { statut } });
  return NextResponse.json(commande);
}