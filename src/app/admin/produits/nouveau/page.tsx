// src/app/admin/produits/nouveau/page.tsx
import { prisma } from "@/lib/prisma";
import { ProduitForm } from "@/components/admin/ProduitForm";

export default async function NouveauProduitPage() {
  const categories = await prisma.category.findMany({ orderBy: { nom: "asc" } });

  return (
    <div>
      <p className="mb-4 text-sm font-medium text-encre">Nouveau produit</p>
      <ProduitForm categories={categories} />
    </div>
  );
}