// src/app/produit/[slug]/page.tsx
// Ajout du composant DonneesStructurees, avec la moyenne des avis calculée.

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductImagePlaceholder } from "@/components/ui/ProductImagePlaceholder";
import { AddToCartButton } from "@/components/produits/AddToCartButton";
import { BoutonLikeProduit } from "@/components/produits/BoutonLikeProduit";
import { SectionAvis } from "@/components/produits/SectionAvis";
import { ProductCard } from "@/components/produits/ProductCard";
import { DonneesStructurees } from "@/components/produits/DonneesStructurees";
import { TraitFeuille } from "@/components/ui/TraitFeuille";
import { formatPrix } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getProduitBySlug, getProduitsSimilaires } from "@/lib/produits";
import { AlerteStock } from "@/components/produits/AlerteStock";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const produit = await getProduitBySlug(slug);

  if (!produit) return { title: "Produit introuvable" };

  const description = produit.description.length > 155
    ? produit.description.slice(0, 155) + "..."
    : produit.description;

  return {
    title: produit.nom,
    description,
    openGraph: {
      title: produit.nom,
      description,
      type: "website",
      images: produit.images[0] ? [{ url: produit.images[0].url }] : undefined,
    },
    alternates: {
      canonical: `/produit/${produit.slug}`,
    },
  };
}

export default async function ProduitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const produit = await getProduitBySlug(slug);

  if (!produit) notFound();

  const [similaires, statsAvis] = await Promise.all([
    getProduitsSimilaires(produit.id, produit.categoryId),
    prisma.review.aggregate({ where: { productId: produit.id }, _avg: { note: true }, _count: true }),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <DonneesStructurees
        nom={produit.nom}
        slug={produit.slug}
        description={produit.description}
        prix={produit.prix}
        stock={produit.stock}
        categorieNom={produit.category.nom}
        categorieSlug={produit.category.slug}
        noteMoyenne={statsAvis._avg.note ?? undefined}
        nombreAvis={statsAvis._count || undefined}
      />

      <p className="mb-6 text-xs text-encre/40">
        Boutique / {produit.category.nom} / {produit.nom}
      </p>

      <div className="flex flex-col gap-10 md:flex-row">
        <div className="h-64 w-full shrink-0 overflow-hidden rounded-2xl md:w-72">
          <ProductImagePlaceholder nom={produit.nom} />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold text-encre">{produit.nom}</h1>
            <BoutonLikeProduit productId={produit.id} />
          </div>
          {produit.category.unite && (
            <p className="mt-1 text-xs text-encre/40">Format : {produit.category.unite}</p>
          )}
          <p className="mt-4 text-2xl font-semibold text-vivrebio-vert">{formatPrix(produit.prix)}</p>
          <p className="mt-4 text-sm leading-relaxed text-encre/70">{produit.description}</p>
          <p className="mt-4 text-xs font-medium text-vivrebio-vert">
            {produit.stock > 0 ? `En stock — ${produit.stock} unités` : "Rupture de stock"}
          </p>
          {/* Import : import { AlerteStock } from "@/components/produits/AlerteStock"; */}
<div className="mt-6">
  {produit.stock > 0 ? (
    <AddToCartButton productId={produit.id} nom={produit.nom} slug={produit.slug} prix={produit.prix} stock={produit.stock} />
  ) : (
    <AlerteStock productId={produit.id} />
  )}
</div>
        </div>
      </div>

      {similaires.length > 0 && (
        <div className="mt-14">
          <p className="text-xs font-semibold uppercase tracking-wide text-vivrebio-rouge">Complétez votre panier</p>
          <h2 className="mt-1 text-lg font-bold text-encre">Vous aimerez aussi</h2>
          <TraitFeuille className="mt-2" />
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {similaires.map((p) => (
              <ProductCard key={p.id} produit={p} />
            ))}
          </div>
        </div>
      )}

      <SectionAvis productId={produit.id} />
    </main>
  );
}