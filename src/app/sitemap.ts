// src/app/sitemap.ts
// Génère automatiquement /sitemap.xml — inclut les pages statiques, toutes les
// fiches produits actives, et les catégories. Régénéré à chaque déploiement/build.

import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [produits, categories] = await Promise.all([
    prisma.product.findMany({ where: { actif: true }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ select: { slug: true } }),
  ]);

  const pagesStatiques: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/boutique`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/a-propos`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/livraison`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/cgv`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/politique-de-confidentialite`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const pagesCategories: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/boutique?categorie=${cat.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const pagesProduits: MetadataRoute.Sitemap = produits.map((p) => ({
    url: `${SITE_URL}/produit/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...pagesStatiques, ...pagesCategories, ...pagesProduits];
}