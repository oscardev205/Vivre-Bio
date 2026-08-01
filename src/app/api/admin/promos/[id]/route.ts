// src/app/api/admin/promos/[id]/route.ts
// PATCH : bascule le statut actif/inactif d'un code promo.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const { id } = await params;
  const { actif } = await request.json();

  const promo = await prisma.promoCode.update({ where: { id }, data: { actif } });
  return NextResponse.json(promo);
}