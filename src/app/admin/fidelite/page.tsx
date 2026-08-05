// src/app/admin/fidelite/page.tsx
// Fichier complet : ajoute le champ "valeur d'un point en FCFA", éditable
// au même endroit que le taux de commission.
"use client";

import { useEffect, useState } from "react";

export default function AdminFidelitePage() {
  const [fideliteActive, setFideliteActive] = useState(true);
  const [parrainageActif, setParrainageActif] = useState(true);
  const [tauxCommission, setTauxCommissionState] = useState("5");
  const [valeurPoint, setValeurPointState] = useState("5");
  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);

  useEffect(() => {
    fetch("/api/admin/parametres")
      .then((res) => res.json())
      .then((data) => {
        setFideliteActive(data.fideliteActive);
        setParrainageActif(data.parrainageActif);
        setTauxCommissionState(String(data.tauxCommission));
        setValeurPointState(String(data.valeurPointFcfa));
      })
      .finally(() => setChargement(false));
  }, []);

  async function basculerFidelite() {
    const nouveauActif = !fideliteActive;
    setFideliteActive(nouveauActif);
    await fetch("/api/admin/parametres", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fideliteActive: nouveauActif }),
    });
  }

  async function basculerParrainage() {
    const nouveauActif = !parrainageActif;
    setParrainageActif(nouveauActif);
    await fetch("/api/admin/parametres", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parrainageActif: nouveauActif }),
    });
  }

  async function enregistrerReglages() {
    setEnregistrement(true);
    await fetch("/api/admin/parametres", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tauxCommission: Number(tauxCommission), valeurPointFcfa: Number(valeurPoint) }),
    });
    setEnregistrement(false);
  }

  if (chargement) return <p className="text-sm text-encre/40">Chargement...</p>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 text-sm font-medium text-encre">Programme de fidélité</p>
        <div className="carte-3d p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-encre">
                Statut : <span className={fideliteActive ? "text-vivrebio-vert" : "text-vivrebio-rouge"}>{fideliteActive ? "Activé" : "Désactivé"}</span>
              </p>
              <p className="mt-1 text-xs text-encre/50">1 point tous les 100 FCFA dépensés.</p>
            </div>
            <button onClick={basculerFidelite} className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${fideliteActive ? "bg-vivrebio-rouge" : "bg-vivrebio-vert"}`}>
              {fideliteActive ? "Désactiver" : "Activer"}
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <label className="text-xs text-encre/60">Valeur d&apos;un point :</label>
            <input
              type="number"
              min={1}
              value={valeurPoint}
              onChange={(e) => setValeurPointState(e.target.value)}
              className="w-20 rounded-lg border border-sable px-2 py-1 text-sm"
            />
            <span className="text-xs text-encre/60">FCFA</span>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-encre">Programme de parrainage</p>
        <div className="carte-3d p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-encre">
                Statut : <span className={parrainageActif ? "text-vivrebio-vert" : "text-vivrebio-rouge"}>{parrainageActif ? "Activé" : "Désactivé"}</span>
              </p>
              <p className="mt-1 text-xs text-encre/50">Un parrain gagne une commission en points sur chaque commande payée de son filleul.</p>
            </div>
            <button onClick={basculerParrainage} className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${parrainageActif ? "bg-vivrebio-rouge" : "bg-vivrebio-vert"}`}>
              {parrainageActif ? "Désactiver" : "Activer"}
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <label className="text-xs text-encre/60">Taux de commission :</label>
            <input
              type="number"
              min={0}
              max={100}
              value={tauxCommission}
              onChange={(e) => setTauxCommissionState(e.target.value)}
              className="w-20 rounded-lg border border-sable px-2 py-1 text-sm"
            />
            <span className="text-xs text-encre/60">% du sous-total</span>
          </div>
        </div>
      </div>

      <button onClick={enregistrerReglages} disabled={enregistrement} className="w-fit rounded-lg bg-vivrebio-vert px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
        {enregistrement ? "Enregistrement..." : "Enregistrer le taux et la valeur du point"}
      </button>
    </div>
  );
}