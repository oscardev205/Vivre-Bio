// src/context/CartContext.tsx
// Ajout : pointsUtilises, géré exactement comme le code promo (persisté en
// localStorage, transmis à la commande).
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

export type PromoApplique = {
  code: string;
  reduction: number;
};

type CartContextType = {
  items: CartItem[];
  ajouterAuPanier: (item: Omit<CartItem, "quantite">, quantite?: number) => void;
  modifierQuantite: (productId: string, quantite: number) => void;
  retirerDuPanier: (productId: string) => void;
  viderPanier: () => void;
  nombreArticles: number;
  sousTotal: number;
  promo: PromoApplique | null;
  appliquerPromo: (promo: PromoApplique) => void;
  retirerPromo: () => void;
  pointsUtilises: number;
  definirPointsUtilises: (points: number) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = "vivrebio-panier";
const STORAGE_KEY_PROMO = "vivrebio-promo";
const STORAGE_KEY_POINTS = "vivrebio-points-utilises";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promo, setPromo] = useState<PromoApplique | null>(null);
  const [pointsUtilises, setPointsUtilises] = useState(0);
  const [charge, setCharge] = useState(false);

  useEffect(() => {
    const sauvegarde = localStorage.getItem(STORAGE_KEY);
    if (sauvegarde) {
      try { setItems(JSON.parse(sauvegarde)); } catch {}
    }
    const promoSauvegarde = localStorage.getItem(STORAGE_KEY_PROMO);
    if (promoSauvegarde) {
      try { setPromo(JSON.parse(promoSauvegarde)); } catch {}
    }
    const pointsSauvegardes = localStorage.getItem(STORAGE_KEY_POINTS);
    if (pointsSauvegardes) {
      try { setPointsUtilises(JSON.parse(pointsSauvegardes)); } catch {}
    }
    setCharge(true);
  }, []);

  useEffect(() => {
    if (charge) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, charge]);

  useEffect(() => {
    if (charge) {
      if (promo) localStorage.setItem(STORAGE_KEY_PROMO, JSON.stringify(promo));
      else localStorage.removeItem(STORAGE_KEY_PROMO);
    }
  }, [promo, charge]);

  useEffect(() => {
    if (charge) localStorage.setItem(STORAGE_KEY_POINTS, JSON.stringify(pointsUtilises));
  }, [pointsUtilises, charge]);

  function ajouterAuPanier(item: Omit<CartItem, "quantite">, quantite = 1) {
    setItems((prev) => {
      const existant = prev.find((i) => i.productId === item.productId);
      if (existant) {
        const nouvelleQte = Math.min(existant.quantite + quantite, existant.stock);
        return prev.map((i) => (i.productId === item.productId ? { ...i, quantite: nouvelleQte } : i));
      }
      return [...prev, { ...item, quantite: Math.min(quantite, item.stock) }];
    });
  }

  function modifierQuantite(productId: string, quantite: number) {
    setItems((prev) =>
      quantite <= 0 ? prev.filter((i) => i.productId !== productId) : prev.map((i) => (i.productId === productId ? { ...i, quantite } : i))
    );
  }

  function retirerDuPanier(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function viderPanier() {
    setItems([]);
    setPromo(null);
    setPointsUtilises(0);
  }

  function appliquerPromo(p: PromoApplique) {
    setPromo(p);
  }

  function retirerPromo() {
    setPromo(null);
  }

  function definirPointsUtilises(points: number) {
    setPointsUtilises(points);
  }

  const nombreArticles = items.reduce((total, i) => total + i.quantite, 0);
  const sousTotal = items.reduce((total, i) => total + i.prix * i.quantite, 0);

  return (
    <CartContext.Provider
      value={{
        items, ajouterAuPanier, modifierQuantite, retirerDuPanier, viderPanier,
        nombreArticles, sousTotal, promo, appliquerPromo, retirerPromo,
        pointsUtilises, definirPointsUtilises,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart doit être utilisé à l'intérieur de <CartProvider>");
  return context;
}