// src/app/boutique/page.tsx
// Ajout de generateMetadata : titre dynamique selon la catégorie/recherche active.

import Link from "next/link";
import clsx from "clsx";
import type { Metadata } from "next";
import { ProductCard } from "@/components/produits/ProductCard";
import { TraitFeuille } from "@/components/ui/TraitFeuille";
import { FadeIn } from "@/components/ui/FadeIn";
import { getCategories, getProduits } from "@/lib/produits";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string; recherche?: string }>;
}): Promise<Metadata> {
  const { categorie, recherche } = await searchParams;

  if (recherche) {
    return { title: `Résultats pour "${recherche}"`, description: `Produits Vivre Bio correspondant à "${recherche}".` };
  }
  if (categorie) {
    const categories = await getCategories();
    const cat = categories.find((c) => c.slug === categorie);
    if (cat) {
      return {
        title: cat.nom,
        description: `Découvrez notre sélection de ${cat.nom.toLowerCase()} naturels et bio, chez Vivre Bio.`,
      };
    }
  }

  return {
    title: "Boutique",
    description: "Huiles essentielles, huiles végétales, poudres, infusions et cosmétiques naturels — toute la boutique Vivre Bio.",
  };
}

export default async function BoutiquePage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string; tri?: "recent" | "prix-asc" | "prix-desc"; recherche?: string }>;
}) {
  const params = await searchParams;
  const [categories, produits] = await Promise.all([
    getCategories(),
    getProduits(params),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-vivrebio-rouge">
        Catalogue
      </p>
      <h1 className="mt-1 text-2xl font-bold text-encre">Notre boutique</h1>
      <TraitFeuille className="mt-2" />

      <form method="get" className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
        {params.categorie && <input type="hidden" name="categorie" value={params.categorie} />}
        <input
          type="text"
          name="recherche"
          defaultValue={params.recherche}
          placeholder="Rechercher un produit..."
          className="w-full rounded-lg border border-sable px-3 py-2.5 text-sm sm:flex-1 sm:py-2"
        />
        <div className="flex gap-2">
          <select
            name="tri"
            defaultValue={params.tri ?? "recent"}
            className="flex-1 rounded-lg border border-sable px-3 py-2.5 text-sm sm:flex-none sm:py-2"
          >
            <option value="recent">Nouveautés</option>
            <option value="prix-asc">Prix croissant</option>
            <option value="prix-desc">Prix décroissant</option>
          </select>
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-vivrebio-vert px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-95 sm:py-2"
          >
            Filtrer
          </button>
        </div>
      </form>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        <Link
          href="/boutique"
          className={clsx(
            "whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-medium transition",
            !params.categorie
              ? "border-vivrebio-vert bg-vivrebio-vert text-white"
              : "border-sable text-encre/60 hover:border-vivrebio-vert hover:text-vivrebio-vert"
          )}
        >
          Tous les produits
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/boutique?categorie=${cat.slug}`}
            className={clsx(
              "whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-medium transition",
              params.categorie === cat.slug
                ? "border-vivrebio-vert bg-vivrebio-vert text-white"
                : "border-sable text-encre/60 hover:border-vivrebio-vert hover:text-vivrebio-vert"
            )}
          >
            {cat.nom}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {produits.map((produit, i) => (
          <FadeIn key={produit.id} delai={(i % 4) * 80}>
            <ProductCard produit={produit} />
          </FadeIn>
        ))}
      </div>

      {produits.length === 0 && (
        <p className="mt-16 text-center text-sm text-encre/40">
          Aucun produit trouvé{params.recherche ? ` pour « ${params.recherche} »` : ""}.
        </p>
      )}
    </main>
  );
}