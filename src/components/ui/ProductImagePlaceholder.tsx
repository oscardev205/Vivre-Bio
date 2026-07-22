// src/components/ui/ProductImagePlaceholder.tsx
// Tant que les vraies photos produits ne sont pas fournies, on affiche
// un bloc de couleur avec l'initiale du produit à la place d'une image.
// A remplacer par un vrai <Image> Next.js dès que les photos arrivent.

export function ProductImagePlaceholder({ nom }: { nom: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-lg bg-green-50">
      <span className="text-3xl font-semibold text-vivrebio-vert">
        {nom.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}