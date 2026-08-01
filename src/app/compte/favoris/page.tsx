// src/app/compte/favoris/page.tsx
// Liste des produits likés par le client — réutilise le modèle ProductLike
// déjà construit pour le bouton coeur des fiches produits.

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/produits/ProductCard";

export default async function FavorisPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id: string }).id;

  const likes = await prisma.productLike.findMany({
    where: { userId },
    include: { product: { include: { category: true, images: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <p className="mb-4 text-sm font-medium text-encre">
        {likes.length} produit{likes.length > 1 ? "s" : ""} aimé{likes.length > 1 ? "s" : ""}
      </p>

      {likes.length === 0 ? (
        <p className="text-sm text-encre/40">
          Aucun favori pour l&apos;instant — cliquez sur le cœur d&apos;une fiche produit pour l&apos;ajouter ici.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {likes.map((l) => (
            <ProductCard key={l.id} produit={l.product} />
          ))}
        </div>
      )}
    </div>
  );
}