// src/app/compte/adresses/page.tsx
// Correction : chargerAdresses passe par useCallback pour éviter le warning
// de re-render en cascade signalé par l'éditeur (non bloquant, mais plus propre).
"use client";

import { useCallback, useEffect, useState } from "react";
import { AddressForm, AdresseData } from "@/components/commande/AddressForm";
import { Star, Trash2 } from "lucide-react";

type Adresse = AdresseData & { id: string; parDefaut: boolean };

export default function AdressesPage() {
  const [adresses, setAdresses] = useState<Adresse[]>([]);
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [chargement, setChargement] = useState(false);

  const chargerAdresses = useCallback(async () => {
    const res = await fetch("/api/adresses");
    const data = await res.json();
    setAdresses(data);
  }, []);

  useEffect(() => {
    chargerAdresses();
  }, [chargerAdresses]);

  async function handleAjout(adresse: AdresseData) {
    setChargement(true);
    await fetch("/api/adresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adresse),
    });
    setChargement(false);
    setAfficherFormulaire(false);
    await chargerAdresses();
  }

  async function definirParDefaut(id: string) {
    await fetch(`/api/adresses/${id}`, { method: "PATCH" });
    await chargerAdresses();
  }

  async function supprimer(id: string) {
    await fetch(`/api/adresses/${id}`, { method: "DELETE" });
    await chargerAdresses();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium">Adresses enregistrées</p>
        <button
          onClick={() => setAfficherFormulaire((v) => !v)}
          className="text-xs text-vivrebio-vert hover:underline"
        >
          {afficherFormulaire ? "Annuler" : "+ Ajouter une adresse"}
        </button>
      </div>

      {afficherFormulaire && (
        <div className="mb-6 rounded-xl border border-gray-100 p-4">
          <AddressForm onSubmit={handleAjout} chargement={chargement} />
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {adresses.map((adresse) => (
          <div key={adresse.id} className="rounded-xl border border-gray-100 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">{adresse.nomComplet}</p>
              {adresse.parDefaut && (
                <span className="flex items-center gap-1 text-xs text-vivrebio-vert">
                  <Star size={12} fill="currentColor" /> Par défaut
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{adresse.adresseDetail}, {adresse.quartier}</p>
            <p className="text-xs text-gray-500">{adresse.ville} · {adresse.telephone}</p>

            <div className="mt-3 flex gap-3 text-xs">
              {!adresse.parDefaut && (
                <button onClick={() => definirParDefaut(adresse.id)} className="text-vivrebio-vert hover:underline">
                  Définir par défaut
                </button>
              )}
              <button onClick={() => supprimer(adresse.id)} className="flex items-center gap-1 text-vivrebio-rouge hover:underline">
                <Trash2 size={12} /> Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {adresses.length === 0 && !afficherFormulaire && (
        <p className="text-sm text-gray-400">Aucune adresse enregistrée pour l&apos;instant.</p>
      )}
    </div>
  );
}