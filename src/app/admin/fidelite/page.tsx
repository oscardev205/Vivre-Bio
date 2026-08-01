// src/app/admin/fidelite/page.tsx
// Vue d'ensemble du programme + interrupteur pour l'activer/désactiver entièrement.
"use client";

import { useEffect, useState } from "react";

export default function AdminFidelitePage() {
  const [actif, setActif] = useState(true);
  const [charge, setCharge] = useState(false);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    fetch("/api/admin/parametres")
      .then((res) => res.json())
      .then((data) => setActif(data.fideliteActive))
      .finally(() => setChargement(false));
  }, []);

  async function basculer() {
    setCharge(true);
    const nouveauActif = !actif;
    await fetch("/api/admin/parametres", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fideliteActive: nouveauActif }),
    });
    setActif(nouveauActif);
    setCharge(false);
  }

  return (
    <div>
      <p className="mb-4 text-sm font-medium text-encre">Programme de fidélité</p>

      {chargement ? (
        <p className="text-sm text-encre/40">Chargement...</p>
      ) : (
        <div className="carte-3d p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-encre">
                Statut : <span className={actif ? "text-vivrebio-vert" : "text-vivrebio-rouge"}>{actif ? "Activé" : "Désactivé"}</span>
              </p>
              <p className="mt-1 text-xs text-encre/50">
                {actif
                  ? "Les clients gagnent et peuvent utiliser des points sur chaque commande."
                  : "Plus aucun point n'est gagné ni utilisable — les soldes existants restent conservés."}
              </p>
            </div>
            <button
              onClick={basculer}
              disabled={charge}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
                actif ? "bg-vivrebio-rouge" : "bg-vivrebio-vert"
              } disabled:opacity-50`}
            >
              {charge ? "..." : actif ? "Désactiver" : "Activer"}
            </button>
          </div>

          <div className="mt-4 rounded-lg bg-vert-pale p-3 text-xs text-encre/70">
            Règles actuelles : 1 point gagné tous les 100 FCFA dépensés (hors frais de livraison),
            1 point = 5 FCFA de réduction.
          </div>
        </div>
      )}
    </div>
  );
}