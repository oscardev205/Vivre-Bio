// src/components/produits/DonneesStructurees.tsx
// Injecte le JSON-LD Schema.org (Product + Offer + AggregateRating + Breadcrumb)
// dans le <head> de la fiche produit — invisible pour l'utilisateur, mais permet
// à Google d'afficher prix/note/disponibilité directement dans les résultats
// de recherche (rich snippets).

import { SITE_URL } from "@/lib/seo";

type Props = {
  nom: string;
  slug: string;
  description: string;
  prix: number;
  stock: number;
  categorieNom: string;
  categorieSlug: string;
  noteMoyenne?: number;
  nombreAvis?: number;
};

export function DonneesStructurees({
  nom,
  slug,
  description,
  prix,
  stock,
  categorieNom,
  categorieSlug,
  noteMoyenne,
  nombreAvis,
}: Props) {
  const donnees = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: nom,
        description,
        offers: {
          "@type": "Offer",
          priceCurrency: "XOF",
          price: prix,
          availability: stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          url: `${SITE_URL}/produit/${slug}`,
        },
        ...(noteMoyenne && nombreAvis
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: noteMoyenne,
                reviewCount: nombreAvis,
              },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Boutique", item: `${SITE_URL}/boutique` },
          { "@type": "ListItem", position: 2, name: categorieNom, item: `${SITE_URL}/boutique?categorie=${categorieSlug}` },
          { "@type": "ListItem", position: 3, name: nom, item: `${SITE_URL}/produit/${slug}` },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(donnees) }}
    />
  );
}