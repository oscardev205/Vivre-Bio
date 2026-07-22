// src/app/produit/[slug]/page.tsx
// Fiche produit dynamique : une page générée pour chacun des 87 produits, à partir de son slug.

import { notFound } from "next/navigation";
import { ProductImagePlaceholder } from "@/components/ui/ProductImagePlaceholder";
import { Button } from "@/components/ui/Button";
import { formatPrix } from "@/lib/format";
import { getProduitBySlug } from "@/lib/produits";

export default async function ProduitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const produit = await getProduitBySlug(slug);

  if (!produit) notFound(); // affiche automatiquement la page 404 de Next.js

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <p className="mb-4 text-xs text-gray-400">
        Boutique / {produit.category.nom} / {produit.nom}
      </p>

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="h-56 w-full shrink-0 md:w-64">
          <ProductImagePlaceholder nom={produit.nom} />
        </div>

        <div className="flex-1">
          <h1 className="text-xl font-semibold">{produit.nom}</h1>
          {produit.category.unite && (
            <p className="text-xs text-gray-400">Format : {produit.category.unite}</p>
          )}
          <p className="mt-3 text-2xl font-semibold text-vivrebio-vert">
            {formatPrix(produit.prix)}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-gray-600">
            {produit.description}
          </p>

          <p className="mt-4 text-xs text-green-700">
            {produit.stock > 0 ? `En stock — ${produit.stock} unités` : "Rupture de stock"}
          </p>

          <div className="mt-6 flex gap-3">
            <Button disabled={produit.stock <= 0}>Ajouter au panier</Button>
            <Button variant="outline" disabled={produit.stock <= 0}>Acheter maintenant</Button>
          </div>
        </div>
      </div>
    </main>
  );
}