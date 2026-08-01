// src/components/admin/ToggleActifButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ToggleActifButton({ id, actif }: { id: string; actif: boolean }) {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);

  async function basculer() {
    setEnCours(true);
    await fetch(`/api/admin/produits/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actif: !actif }),
    });
    setEnCours(false);
    router.refresh();
  }

  return (
    <button
      onClick={basculer}
      disabled={enCours}
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition ${
        actif ? "bg-vivrebio-vert text-white" : "bg-encre/10 text-encre/60"
      }`}
    >
      {actif ? "Actif" : "Inactif"}
    </button>
  );
}