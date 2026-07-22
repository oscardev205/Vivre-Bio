// src/components/produits/ProductCard.tsx
// Carte produit réutilisée dans la page d'accueil et le catalogue.

import Link from "next/link";
import { formatPrix } from "@/lib/format";
import { ProductImagePlaceholder } from "@/components/ui/ProductImagePlaceholder";
import { Badge } from "@/components/ui/Badge";
import type { ProductWithRelations } from "@/types";

export function ProductCard({ produit }: { produit: ProductWithRelations }) {
  const enRupture = produit.stock <= 0;

  return (
    <Link
      href={`/produit/${produit.slug}`}
      className="block overflow-hidden rounded-xl border border-gray-100 transition hover:shadow-md"
    >
      <div className="relative h-32 w-full">
        <ProductImagePlaceholder nom={produit.nom} />
        {enRupture && (
          <span className="absolute left-2 top-2">
            <Badge variant="gris">Rupture</Badge>
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-gray-800">{produit.nom}</p>
        <p className="mt-1 line-clamp-1 text-xs text-gray-500">{produit.description}</p>
        <p className="mt-2 text-sm font-semibold text-vivrebio-vert">
          {formatPrix(produit.prix)}
        </p>
      </div>
    </Link>
  );
}