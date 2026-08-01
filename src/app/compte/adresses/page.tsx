// src/app/compte/adresses/page.tsx
// Ajout : message clair après suppression/archivage, et gestion d'erreur visible
// (au lieu d'un échec silencieux).
"use client";

import { useCallback, useEffect, useState } from "react";
import { AddressForm, AdresseData } from "@/components/commande/AddressForm";
import { Star, Trash2 } from "lucide-react";

type Adresse = AdresseData & { id: string; parDefaut: boolean };

export default function AdressesPage() {
  const [adresses, setAdresses] = useState<Adresse[]>([]);
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [message, setMessage] = useState("");

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
    const res = await fetch(`/api/adresses/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (res.ok) {
      setMessage(
        data.archivee
          ? "Cette adresse est utilisée dans une commande passée — elle a été retirée de votre liste mais reste liée à l'historique de cette commande."
          : "Adresse supprimée."
      );
    } else {
      setMessage(data.erreur || "Une erreur est survenue.");
    }

    setTimeout(() => setMessage(""), 5000);
    await chargerAdresses();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-encre">Adresses enregistrées</p>
        <button
          onClick={() => setAfficherFormulaire((v) => !v)}
          className="text-xs text-vivrebio-vert hover:underline"
        >
          {afficherFormulaire ? "Annuler" : "+ Ajouter une adresse"}
        </button>
      </div>

      {message && (
        <p className="mb-4 rounded-lg bg-vert-pale px-3 py-2 text-xs text-encre">{message}</p>
      )}

      {afficherFormulaire && (
        <div className="mb-6">
          <AddressForm onSubmit={handleAjout} chargement={chargement} libelleBouton="Enregistrer cette adresse" />
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {adresses.map((adresse) => (
          <div key={adresse.id} className="carte-3d p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-encre">{adresse.nomComplet}</p>
              {adresse.parDefaut && (
                <span className="flex items-center gap-1 text-xs text-vivrebio-vert">
                  <Star size={12} fill="currentColor" /> Par défaut
                </span>
              )}
            </div>
            <p className="text-xs text-encre/50">{adresse.adresseDetail}, {adresse.quartier}</p>
            <p className="text-xs text-encre/50">{adresse.ville} · {adresse.telephone}</p>

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
        <p className="text-sm text-encre/40">Aucune adresse enregistrée pour l&apos;instant.</p>
      )}
    </div>
  );
}