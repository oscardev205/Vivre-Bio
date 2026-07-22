// src/app/boutique/page.tsx
// Page catalogue : liste des catégories à gauche, grille de produits filtrée à droite.
// Les filtres (catégorie, tri) sont lus directement dans l'URL (?categorie=...&tri=...).

import Link from "next/link";
import clsx from "clsx";
import { ProductCard } from "@/components/produits/ProductCard";
import { getCategories, getProduits } from "@/lib/produits";

export default async function BoutiquePage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string; tri?: "recent" | "prix-asc" | "prix-desc" }>;
}) {
  const params = await searchParams;
  const [categories, produits] = await Promise.all([
    getCategories(),
    getProduits(params),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold text-vivrebio-vert">Notre boutique</h1>

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Filtres catégories */}
        <aside className="w-full shrink-0 md:w-48">
          <p className="mb-2 text-xs font-semibold text-gray-500">Catégories</p>
          <ul className="space-y-1 text-sm">
            <li>
              <Link
                href="/boutique"
                className={clsx(!params.categorie && "font-medium text-vivrebio-vert")}
              >
                Tous les produits
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/boutique?categorie=${cat.slug}`}
                  className={clsx(
                    "block",
                    params.categorie === cat.slug
                      ? "font-medium text-vivrebio-vert"
                      : "text-gray-600 hover:text-vivrebio-vert"
                  )}
                >
                  {cat.nom} ({cat._count.produits})
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Grille produits */}
        <section className="flex-1">
          <p className="mb-3 text-xs text-gray-500">{produits.length} produit(s)</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {produits.map((produit) => (
              <ProductCard key={produit.id} produit={produit} />
            ))}
          </div>
          {produits.length === 0 && (
            <p className="mt-10 text-center text-sm text-gray-400">
              Aucun produit trouvé dans cette catégorie.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}