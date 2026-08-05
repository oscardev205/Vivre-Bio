// src/components/admin/AssignerLivreurForm.tsx
// Liste les livreurs disponibles et permet d'assigner la commande à l'un
// d'eux — passe automatiquement le statut à EXPEDIEE des deux côtés
// (client et admin lisent le même champ).
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Livreur = { id: string; nom: string | null; telephone: string | null };

export function AssignerLivreurForm({ numero, livreurActuelId }: { numero: string; livreurActuelId: string | null }) {
  const router = useRouter();
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [selection, setSelection] = useState(livreurActuelId ?? "");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    fetch("/api/admin/commandes/livreurs-disponibles")
      .then((res) => res.json())
      .then(setLivreurs)
      .catch(() => setLivreurs([]));
  }, []);

  async function handleAssigner() {
    if (!selection) return;
    setChargement(true);
    setErreur("");

    const res = await fetch(`/api/admin/commandes/${numero}/assigner`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ livreurId: selection }),
    });

    setChargement(false);

    if (!res.ok) {
      const data = await res.json();
      setErreur(data.erreur || "Une erreur est survenue.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="rounded-xl border border-sable p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-encre/40">Assigner un livreur</p>
      {livreurs.length === 0 ? (
        <p className="text-xs text-encre/40">Aucun livreur disponible pour le moment.</p>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={selection}
            onChange={(e) => setSelection(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-sable px-3 py-2 text-sm"
          >
            <option value="">Choisir un livreur...</option>
            {livreurs.map((l) => (
              <option key={l.id} value={l.id}>{l.nom ?? "Sans nom"} {l.telephone ? `(${l.telephone})` : ""}</option>
            ))}
          </select>
          <button
            onClick={handleAssigner}
            disabled={!selection || chargement}
            className="shrink-0 rounded-lg bg-vivrebio-vert px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {chargement ? "..." : livreurActuelId ? "Réassigner" : "Assigner"}
          </button>
        </div>
      )}
      {erreur && <p className="mt-2 text-xs text-vivrebio-rouge">{erreur}</p>}
    </div>
  );
}