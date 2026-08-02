// src/app/api/admin/blog/[id]/route.ts
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
  if (typeof body.titre === "string") donnees.titre = body.titre;
  if (typeof body.extrait === "string") donnees.extrait = body.extrait;
  if (typeof body.contenu === "string") donnees.contenu = body.contenu;
  if (typeof body.publie === "boolean") donnees.publie = body.publie;

  const post = await prisma.post.update({ where: { id }, data: donnees });
  return NextResponse.json(post);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const { id } = await params;
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}