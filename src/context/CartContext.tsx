// src/context/CartContext.tsx
// Gère l'état du panier côté client, avec persistance dans localStorage
// pour que le panier survive à un rafraîchissement de page.
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type CartItem = {
  productId: string;
  nom: string;
  slug: string;
  prix: number;
  quantite: number;
  stock: number;
};

type CartContextType = {
  items: CartItem[];
  ajouterAuPanier: (item: Omit<CartItem, "quantite">, quantite?: number) => void;
  modifierQuantite: (productId: string, quantite: number) => void;
  retirerDuPanier: (productId: string) => void;
  viderPanier: () => void;
  nombreArticles: number;
  sousTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = "vivrebio-panier";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [charge, setCharge] = useState(false);

  // Charger le panier sauvegardé au premier rendu (uniquement côté navigateur)
  useEffect(() => {
    const sauvegarde = localStorage.getItem(STORAGE_KEY);
    if (sauvegarde) {
      try {
        setItems(JSON.parse(sauvegarde));
      } catch {
        // panier corrompu, on ignore et repart d'un panier vide
      }
    }
    setCharge(true);
  }, []);

  // Sauvegarder à chaque changement, seulement après le chargement initial
  useEffect(() => {
    if (charge) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, charge]);

  function ajouterAuPanier(item: Omit<CartItem, "quantite">, quantite = 1) {
    setItems((prev) => {
      const existant = prev.find((i) => i.productId === item.productId);
      if (existant) {
        const nouvelleQte = Math.min(existant.quantite + quantite, existant.stock);
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, quantite: nouvelleQte } : i
        );
      }
      return [...prev, { ...item, quantite: Math.min(quantite, item.stock) }];
    });
  }

  function modifierQuantite(productId: string, quantite: number) {
    setItems((prev) =>
      quantite <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, quantite } : i))
    );
  }

  function retirerDuPanier(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function viderPanier() {
    setItems([]);
  }

  const nombreArticles = items.reduce((total, i) => total + i.quantite, 0);
  const sousTotal = items.reduce((total, i) => total + i.prix * i.quantite, 0);

  return (
    <CartContext.Provider
      value={{ items, ajouterAuPanier, modifierQuantite, retirerDuPanier, viderPanier, nombreArticles, sousTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook pratique pour utiliser le panier dans n'importe quel composant client
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart doit être utilisé à l'intérieur de <CartProvider>");
  return context;
}