// src/app/admin/produits/[id]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProduitForm } from "@/components/admin/ProduitForm";

export default async function EditerProduitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [produit, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { nom: "asc" } }),
  ]);

  if (!produit) notFound();

  return (
    <div>
      <p className="mb-4 text-sm font-medium text-encre">Modifier « {produit.nom} »</p>
      <ProduitForm
        categories={categories}
        valeursInitiales={{
          id: produit.id,
          nom: produit.nom,
          description: produit.description,
          prix: produit.prix,
          stock: produit.stock,
          categoryId: produit.categoryId,
          actif: produit.actif,
          seuilAlerte: produit.seuilAlerte,
        }}
      />
    </div>
  );
}