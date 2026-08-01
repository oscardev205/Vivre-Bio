// src/components/commande/ModeLivraisonChoix.tsx
// Bascule entre livraison à domicile et retrait en boutique — le retrait n'a
// aucun frais et ne nécessite pas de carte/adresse.
"use client";

import { FaTruckFast, FaShop } from "react-icons/fa6";

type Props = {
  mode: "LIVRAISON" | "RETRAIT";
  onChange: (mode: "LIVRAISON" | "RETRAIT") => void;
};

export function ModeLivraisonChoix({ mode, onChange }: Props) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onChange("LIVRAISON")}
        className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 text-sm font-medium transition ${
          mode === "LIVRAISON" ? "border-vivrebio-vert bg-vert-pale text-encre" : "border-sable text-encre/50"
        }`}
      >
        <FaTruckFast size={18} className={mode === "LIVRAISON" ? "text-vivrebio-vert" : ""} />
        Livraison à domicile
      </button>
      <button
        type="button"
        onClick={() => onChange("RETRAIT")}
        className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 text-sm font-medium transition ${
          mode === "RETRAIT" ? "border-vivrebio-vert bg-vert-pale text-encre" : "border-sable text-encre/50"
        }`}
      >
        <FaShop size={18} className={mode === "RETRAIT" ? "text-vivrebio-vert" : ""} />
        Retrait en boutique
        <span className="text-[10px] font-normal text-vivrebio-vert">Gratuit</span>
      </button>
    </div>
  );
}