// src/components/livreur/BoutonConfirmerLivraisonLivreur.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function BoutonConfirmerLivraisonLivreur({ numero }: { numero: string }) {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);

  async function confirmer() {
    setChargement(true);
    const res = await fetch(`/api/livreur/livraisons/${numero}/statut`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: "LIVREE" }),
    });
    setChargement(false);
    if (res.ok) router.refresh();
  }

  return (
    <Button onClick={confirmer} disabled={chargement} className="w-full">
      {chargement ? "Confirmation..." : "Confirmer la livraison"}
    </Button>
  );
}