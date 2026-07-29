// src/app/panier/page.tsx
// Page panier : liste des articles, modification des quantités, résumé et bouton de commande.
"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrix } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";

const FRAIS_LIVRAISON = 1500; // valeur fixe pour l'instant, sera dynamique selon la ville plus tard

export default function PanierPage() {
  const { items, modifierQuantite, retirerDuPanier, sousTotal } = useCart();

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-gray-500">Votre panier est vide.</p>
        <Link href="/boutique">
          <Button className="mt-4">Découvrir la boutique</Button>
        </Link>
      </main>
    );
  }

  const total = sousTotal + FRAIS_LIVRAISON;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold text-vivrebio-vert">
        Mon panier ({items.length} article{items.length > 1 ? "s" : ""})
      </h1>

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="flex-1 divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center gap-4 py-3">
              <div className="flex-1">
                <p className="text-sm font-medium">{item.nom}</p>
                <p className="text-xs text-gray-400">{formatPrix(item.prix)} / unité</p>
              </div>

              <div className="flex items-center rounded-lg border border-gray-200">
                <button
                  className="px-2.5 py-1 text-sm"
                  onClick={() => modifierQuantite(item.productId, item.quantite - 1)}
                >
                  −
                </button>
                <span className="border-x border-gray-200 px-3 py-1 text-sm">{item.quantite}</span>
                <button
                  className="px-2.5 py-1 text-sm"
                  onClick={() => modifierQuantite(item.productId, item.quantite + 1)}
                  disabled={item.quantite >= item.stock}
                >
                  +
                </button>
              </div>

              <p className="w-20 text-right text-sm font-medium">
                {formatPrix(item.prix * item.quantite)}
              </p>

              <button onClick={() => retirerDuPanier(item.productId)} aria-label="Retirer l'article">
                <Trash2 size={16} className="text-gray-400 hover:text-vivrebio-rouge" />
              </button>
            </div>
          ))}
        </div>

        <aside className="w-full shrink-0 rounded-xl bg-gray-50 p-5 md:w-64">
          <p className="mb-3 text-sm font-medium">Résumé</p>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Sous-total</span>
            <span>{formatPrix(sousTotal)}</span>
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-gray-500">
            <span>Livraison estimée</span>
            <span>{formatPrix(FRAIS_LIVRAISON)}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 text-sm font-semibold">
            <span>Total</span>
            <span className="text-vivrebio-vert">{formatPrix(total)}</span>
          </div>
          <Link href="/commande">
            <Button className="mt-4 w-full">Passer la commande</Button>
          </Link>
        </aside>
      </div>
    </main>
  );
}