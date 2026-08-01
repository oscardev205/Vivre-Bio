// src/components/produits/ProductCard.tsx
// Fichier complet : la carte devient un flex-col en h-full, avec le bloc de
// texte en flex-1 — combiné à un grid-auto-rows uniforme côté page, toutes les
// cartes d'une même rangée s'étirent désormais à la même hauteur, peu importe
// que le titre fasse 1 ou 2 lignes.

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
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-sable bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-encre/5 dark:bg-[#1c2921]"
    >
      <div className="relative h-36 w-full shrink-0 overflow-hidden">
        <ProductImagePlaceholder nom={produit.nom} />
        {enRupture && (
          <span className="absolute left-2.5 top-2.5">
            <Badge variant="gris">Rupture</Badge>
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-3.5">
        <p className="line-clamp-2 text-sm font-medium text-encre">{produit.nom}</p>
        <p className="mt-1 line-clamp-1 text-xs text-encre/50">{produit.description}</p>
        <p className="mt-auto pt-2 text-sm font-semibold text-vivrebio-vert">
          {formatPrix(produit.prix)}
        </p>
      </div>
    </Link>
  );
}