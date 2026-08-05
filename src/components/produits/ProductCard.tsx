// src/components/produits/ProductCard.tsx
// Fichier complet : utilise désormais ProductImage avec imageUrl au lieu de
// ProductImagePlaceholder, avec toutes les corrections déjà en place
// (fond adapté au thème, min-w-0, line-clamp, flex-col pour hauteur uniforme).

import Link from "next/link";
import { formatPrix } from "@/lib/format";
import { ProductImage } from "@/components/ui/ProductImage";
import { Badge } from "@/components/ui/Badge";
import type { ProductWithRelations } from "@/types";

export function ProductCard({ produit }: { produit: ProductWithRelations }) {
  const enRupture = produit.stock <= 0;

  return (
    <Link
      href={`/produit/${produit.slug}`}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-sable bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-encre/5 dark:bg-[#1c2921]"
    >
      <div className="relative aspect-square w-full shrink-0 overflow-hidden">
        <ProductImage slug={produit.slug} nom={produit.nom} imageUrl={produit.imageUrl} />
        {enRupture && (
          <span className="absolute left-2.5 top-2.5">
            <Badge variant="gris">Rupture</Badge>
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-3.5">
        <p className="line-clamp-2 text-sm font-medium text-encre">{produit.nom}</p>
        <p className="mt-1 line-clamp-1 text-xs text-encre/50">{produit.description}</p>
        <p className="mt-2 text-sm font-semibold text-vivrebio-vert">
          {formatPrix(produit.prix)}
        </p>
      </div>
    </Link>
  );
}