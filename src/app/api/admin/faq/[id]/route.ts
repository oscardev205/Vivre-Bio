// src/app/api/admin/faq/[id]/route.ts
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
  if (typeof body.question === "string") donnees.question = body.question;
  if (typeof body.reponse === "string") donnees.reponse = body.reponse;
  if (typeof body.publie === "boolean") donnees.publie = body.publie;
  if (typeof body.ordre === "number") donnees.ordre = body.ordre;

  const item = await prisma.faqItem.update({ where: { id }, data: donnees });
  return NextResponse.json(item);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const { id } = await params;
  await prisma.faqItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}