// src/app/api/admin/zones-livraison/[id]/route.ts
// Fichier complet : whitelist des champs modifiables.

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
  const body = await request.json();

  const donnees: Record<string, unknown> = {};
  if (typeof body.ville === "string") donnees.ville = body.ville;
  if (typeof body.frais === "number") donnees.frais = body.frais;
  if (body.delaiEstime === null || typeof body.delaiEstime === "string") donnees.delaiEstime = body.delaiEstime;
  if (typeof body.actif === "boolean") donnees.actif = body.actif;

  const zone = await prisma.deliveryZone.update({ where: { id }, data: donnees });
  return NextResponse.json(zone);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const { id } = await params;
  await prisma.deliveryZone.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}