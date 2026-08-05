// src/app/api/admin/produits/route.ts
// Fichier complet : ajoute imageUrl à la création, sans toucher au reste
// (vérification du slug déjà existante, conservée telle quelle).

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { genererSlug } from "@/lib/slug";
import { requireAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const body = await request.json();
  const { nom, description, prix, stock, categoryId, actif, seuilAlerte, imageUrl } = body;

  if (!nom || !description || !categoryId || Number.isNaN(prix) || Number.isNaN(stock)) {
    return NextResponse.json({ erreur: "Champs invalides" }, { status: 400 });
  }

  const slug = genererSlug(nom);
  const slugExistant = await prisma.product.findUnique({ where: { slug } });
  if (slugExistant) {
    return NextResponse.json({ erreur: "Un produit avec un nom très proche existe déjà" }, { status: 409 });
  }

  const produit = await prisma.product.create({
    data: {
      nom, slug, description, prix, stock, categoryId, actif,
      seuilAlerte: seuilAlerte ?? null,
      imageUrl: imageUrl || null,
    },
  });

  return NextResponse.json(produit);
}