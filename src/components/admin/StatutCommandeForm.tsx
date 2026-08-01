// src/components/admin/StatutCommandeForm.tsx
// Changement de statut d'une commande, avec confirmation visuelle immédiate.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUTS = ["EN_ATTENTE", "PAYEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE", "ANNULEE"];

export function StatutCommandeForm({ numero, statutActuel }: { numero: string; statutActuel: string }) {
  const router = useRouter();
  const [statut, setStatut] = useState(statutActuel);
  const [chargement, setChargement] = useState(false);

  async function handleChange(nouveauStatut: string) {
    setStatut(nouveauStatut);
    setChargement(true);
    await fetch(`/api/admin/commandes/${numero}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: nouveauStatut }),
    });
    setChargement(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={statut}
        onChange={(e) => handleChange(e.target.value)}
        disabled={chargement}
        className="rounded-lg border border-sable px-3 py-1.5 text-sm"
      >
        {STATUTS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      {chargement && <span className="text-xs text-encre/40">Mise à jour...</span>}
    </div>
  );
}