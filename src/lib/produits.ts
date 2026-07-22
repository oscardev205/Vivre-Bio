// src/lib/produits.ts
// Fonctions d'accès aux données produits/catégories.
// Centraliser ces requêtes ici évite de dupliquer la logique Prisma dans chaque page.

import { prisma } from "@/lib/prisma";
import type { BoutiqueSearchParams } from "@/types";

// Récupère toutes les catégories avec leur nombre de produits actifs
export async function getCategories() {
  return prisma.category.findMany({
    include: {
      _count: { select: { produits: { where: { actif: true } } } },
    },
    orderBy: { nom: "asc" },
  });
}

// Récupère les produits du catalogue, avec filtres optionnels (catégorie, recherche, tri)
export async function getProduits(params: BoutiqueSearchParams = {}) {
  const { categorie, tri = "recent", recherche } = params;

  const orderBy =
    tri === "prix-asc" ? { prix: "asc" as const } :
    tri === "prix-desc" ? { prix: "desc" as const } :
    { createdAt: "desc" as const };

  return prisma.product.findMany({
    where: {
      actif: true,
      ...(categorie ? { category: { slug: categorie } } : {}),
      ...(recherche ? { nom: { contains: recherche, mode: "insensitive" as const } } : {}),
    },
    include: { category: true, images: true },
    orderBy,
  });
}

// Récupère un seul produit par son slug, pour la fiche produit
export async function getProduitBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { category: true, images: true },
  });
}

// Récupère quelques produits phares pour la page d'accueil
export async function getProduitsPhares(limite = 3) {
  return prisma.product.findMany({
    where: { actif: true },
    include: { category: true, images: true },
    orderBy: { createdAt: "desc" },
    take: limite,
  });
}