// src/app/admin/page.tsx
// Fichier complet : les deux cartes de graphiques passent en overflow-x-auto
// avec une largeur minimale, pour garantir un affichage lisible même sur un
// très petit écran plutôt que de compresser le graphique à l'illisible.

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrix } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { GraphiqueVentes, GraphiqueTopProduits } from "@/components/admin/StatsCharts";
import { getVentesParMois, getProduitsPlusVendus } from "@/lib/stats";

const STATUTS_PAYES = ["PAYEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE"] as const;

export default async function AdminDashboardPage() {
  const [chiffreAffaires, nombreCommandes, produitsRupture, dernieresCommandes, ventesParMois, topProduits] =
    await Promise.all([
      prisma.order.aggregate({
        where: { statut: { in: [...STATUTS_PAYES] } },
        _sum: { total: true },
      }),
      prisma.order.count({ where: { statut: { in: [...STATUTS_PAYES] } } }),
      prisma.product.count({ where: { stock: { lte: 0 }, actif: true } }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { items: true } }),
      getVentesParMois(),
      getProduitsPlusVendus(5),
    ]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="carte-3d p-4">
          <p className="text-xs text-encre/40">Chiffre d&apos;affaires</p>
          <p className="mt-1 text-2xl font-semibold text-vivrebio-vert">
            {formatPrix(chiffreAffaires._sum.total ?? 0)}
          </p>
        </div>
        <div className="carte-3d p-4">
          <p className="text-xs text-encre/40">Commandes payées</p>
          <p className="mt-1 text-2xl font-semibold text-encre">{nombreCommandes}</p>
        </div>
        <div className="carte-3d p-4">
          <p className="text-xs text-encre/40">Produits en rupture</p>
          <p className="mt-1 text-2xl font-semibold text-vivrebio-rouge">{produitsRupture}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="carte-3d p-4">
          <p className="mb-2 text-sm font-medium text-encre">Évolution du chiffre d&apos;affaires</p>
          <div className="overflow-x-auto">
            <div className="min-w-[320px]">
              <GraphiqueVentes donnees={ventesParMois} />
            </div>
          </div>
        </div>
        <div className="carte-3d p-4">
          <p className="mb-2 text-sm font-medium text-encre">Produits les plus vendus</p>
          <div className="overflow-x-auto">
            <div className="min-w-[320px]">
              <GraphiqueTopProduits donnees={topProduits} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <p className="mb-3 text-sm font-medium text-encre">Dernières commandes</p>
        <div className="carte-3d divide-y divide-sable">
          {dernieresCommandes.map((commande) => (
            <Link
              key={commande.id}
              href={`/admin/commandes/${commande.numero}`}
              className="flex flex-col gap-2 p-3 text-sm hover:bg-vert-pale sm:flex-row sm:items-center sm:justify-between"
            >
              <span>{commande.numero} · {commande.items.length} article(s)</span>
              <span className="flex items-center gap-3">
                {formatPrix(commande.total)}
                <Badge variant={commande.statut === "EN_ATTENTE" ? "gris" : "vert"}>{commande.statut}</Badge>
              </span>
            </Link>
          ))}
          {dernieresCommandes.length === 0 && (
            <p className="p-4 text-center text-sm text-encre/40">Aucune commande pour l&apos;instant.</p>
          )}
        </div>
      </div>
    </div>
  );
}