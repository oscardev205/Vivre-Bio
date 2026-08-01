// src/lib/stats.ts
// Calculs statistiques pour le tableau de bord admin : évolution du CA par mois,
// et les produits les plus vendus. Utilise du SQL brut pour le regroupement par
// mois (Prisma ne le fait pas nativement), avec conversion BigInt → Number
// nécessaire car BigInt n'est pas sérialisable en JSON tel quel.

import { prisma } from "@/lib/prisma";

const STATUTS_PAYES = ["PAYEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE"];

export type VenteParMois = { mois: string; total: number };
export type ProduitVendu = { nom: string; quantiteVendue: number };

export async function getVentesParMois(): Promise<VenteParMois[]> {
  const resultats = await prisma.$queryRaw<{ mois: Date; total: bigint }[]>`
    SELECT date_trunc('month', "createdAt") as mois, SUM(total) as total
    FROM "Order"
    WHERE statut IN ('PAYEE', 'EN_PREPARATION', 'EXPEDIEE', 'LIVREE')
    GROUP BY mois
    ORDER BY mois ASC
    LIMIT 12
  `;

  return resultats.map((r) => ({
    mois: new Date(r.mois).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
    total: Number(r.total),
  }));
}

export async function getProduitsPlusVendus(limite = 5): Promise<ProduitVendu[]> {
  const groupes = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantite: true },
    orderBy: { _sum: { quantite: "desc" } },
    take: limite,
  });

  const produitsIds = groupes.map((g) => g.productId);
  const produits = await prisma.product.findMany({ where: { id: { in: produitsIds } } });

  return groupes.map((g) => ({
    nom: produits.find((p) => p.id === g.productId)?.nom ?? "Produit supprimé",
    quantiteVendue: g._sum.quantite ?? 0,
  }));
}

export async function getStatutsCommandes(): Promise<{ statut: string; nombre: number }[]> {
  const groupes = await prisma.order.groupBy({
    by: ["statut"],
    _count: true,
  });
  return groupes.map((g) => ({ statut: g.statut, nombre: g._count }));
}