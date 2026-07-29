// src/components/layout/CartIcon.tsx
// Icône panier avec badge de comptage — composant client car il lit le CartContext.
"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function CartIcon() {
  const { nombreArticles } = useCart();

  return (
    <Link href="/panier" className="relative">
      <ShoppingCart size={20} />
      {nombreArticles > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-vivrebio-rouge text-[10px] text-white">
          {nombreArticles}
        </span>
      )}
    </Link>
  );
}