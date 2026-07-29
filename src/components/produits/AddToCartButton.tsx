// src/components/produits/AddToCartButton.tsx
// Composant client (interactif) : gère la quantité et l'ajout au panier.
"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";

type Props = {
  productId: string;
  nom: string;
  slug: string;
  prix: number;
  stock: number;
};

export function AddToCartButton({ productId, nom, slug, prix, stock }: Props) {
  const { ajouterAuPanier } = useCart();
  const [quantite, setQuantite] = useState(1);
  const [confirme, setConfirme] = useState(false);

  const enRupture = stock <= 0;

  function handleAjout() {
    ajouterAuPanier({ productId, nom, slug, prix, stock }, quantite);
    setConfirme(true);
    setTimeout(() => setConfirme(false), 1500);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-fit items-center rounded-lg border border-gray-200">
        <button
          className="px-3 py-1.5 text-sm"
          onClick={() => setQuantite((q) => Math.max(1, q - 1))}
          disabled={enRupture}
        >
          −
        </button>
        <span className="border-x border-gray-200 px-4 py-1.5 text-sm">{quantite}</span>
        <button
          className="px-3 py-1.5 text-sm"
          onClick={() => setQuantite((q) => Math.min(stock, q + 1))}
          disabled={enRupture}
        >
          +
        </button>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleAjout} disabled={enRupture}>
          {confirme ? "Ajouté ✓" : "Ajouter au panier"}
        </Button>
        <Button variant="outline" disabled={enRupture}>
          Acheter maintenant
        </Button>
      </div>
    </div>
  );
}