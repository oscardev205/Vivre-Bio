// src/app/api/admin/produits/[id]/route.ts
// Fichier complet : ajoute imageUrl à la whitelist déjà en place.

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
  if (typeof body.nom === "string") donnees.nom = body.nom;
  if (typeof body.description === "string") donnees.description = body.description;
  if (typeof body.prix === "number") donnees.prix = body.prix;
  if (typeof body.stock === "number") donnees.stock = body.stock;
  if (typeof body.categoryId === "string") donnees.categoryId = body.categoryId;
  if (typeof body.actif === "boolean") donnees.actif = body.actif;
  if (body.seuilAlerte === null || typeof body.seuilAlerte === "number") donnees.seuilAlerte = body.seuilAlerte;
  if (body.imageUrl === null || typeof body.imageUrl === "string") donnees.imageUrl = body.imageUrl;

  const produit = await prisma.product.update({ where: { id }, data: donnees });
  return NextResponse.json(produit);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const { id } = await params;

  const nombreCommandes = await prisma.orderItem.count({ where: { productId: id } });
  if (nombreCommandes > 0) {
    return NextResponse.json(
      { erreur: "Ce produit apparaît dans des commandes existantes — désactive-le plutôt que de le supprimer." },
      { status: 409 }
    );
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}