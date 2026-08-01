// src/app/admin/produits/page.tsx
// Fichier complet : le tableau reste dans son propre conteneur à défilement
// horizontal (overflow-x-auto déjà présent), formulaire de recherche empilé
// proprement sur mobile.

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrix } from "@/lib/format";
import { ToggleActifButton } from "@/components/admin/ToggleActifButton";

export default async function AdminProduitsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const produits = await prisma.product.findMany({
    where: q ? { nom: { contains: q, mode: "insensitive" } } : undefined,
    include: { category: true },
    orderBy: { nom: "asc" },
  });

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form method="get" className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Rechercher un produit..."
            className="min-w-0 flex-1 rounded-lg border border-sable px-3 py-2 text-sm sm:flex-none"
          />
          <button type="submit" className="shrink-0 rounded-lg border border-sable px-3 py-2 text-sm text-encre/70">
            Rechercher
          </button>
        </form>
        <Link
          href="/admin/produits/nouveau"
          className="shrink-0 rounded-lg bg-vivrebio-vert px-4 py-2 text-center text-sm font-medium text-white"
        >
          + Nouveau produit
        </Link>
      </div>

      <p className="mb-2 text-xs text-encre/40">{produits.length} produit(s)</p>

      <div className="overflow-x-auto rounded-xl border border-sable">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-sable bg-vert-pale text-left text-xs text-encre/60">
              <th className="p-3">Produit</th>
              <th className="p-3">Catégorie</th>
              <th className="p-3">Prix</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Statut</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {produits.map((produit) => (
              <tr key={produit.id} className="border-b border-sable last:border-0">
                <td className="p-3 text-encre">{produit.nom}</td>
                <td className="p-3 text-encre/60">{produit.category.nom}</td>
                <td className="p-3 text-encre">{formatPrix(produit.prix)}</td>
                <td className="p-3">
                  <span className={produit.stock <= 0 ? "text-vivrebio-rouge" : "text-encre"}>
                    {produit.stock}
                  </span>
                </td>
                <td className="p-3">
                  <ToggleActifButton id={produit.id} actif={produit.actif} />
                </td>
                <td className="p-3 text-right">
                  <Link href={`/admin/produits/${produit.id}`} className="text-xs text-vivrebio-vert hover:underline">
                    Modifier
                  </Link>
                </td>
              </tr>
            ))}
            {produits.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-encre/40">Aucun produit trouvé.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}