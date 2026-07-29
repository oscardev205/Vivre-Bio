// src/components/commande/AddressForm.tsx
// Formulaire d'adresse de livraison réutilisé pour l'achat invité ET l'achat connecté.
// Le parent décide quoi faire des données via onSubmit.
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export type AdresseData = {
  nomComplet: string;
  telephone: string;
  ville: string;
  quartier: string;
  adresseDetail: string;
  instructions?: string;
};

type Props = {
  onSubmit: (adresse: AdresseData) => void;
  chargement?: boolean;
  valeursInitiales?: Partial<AdresseData>;
};

export function AddressForm({ onSubmit, chargement, valeursInitiales }: Props) {
  const [erreur, setErreur] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const adresse: AdresseData = {
      nomComplet: String(formData.get("nomComplet") || ""),
      telephone: String(formData.get("telephone") || ""),
      ville: String(formData.get("ville") || ""),
      quartier: String(formData.get("quartier") || ""),
      adresseDetail: String(formData.get("adresseDetail") || ""),
      instructions: String(formData.get("instructions") || "") || undefined,
    };

    if (!adresse.nomComplet || !adresse.telephone || !adresse.ville || !adresse.adresseDetail) {
      setErreur("Merci de remplir tous les champs obligatoires.");
      return;
    }
    setErreur("");
    onSubmit(adresse);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="nomComplet"
          placeholder="Nom complet"
          defaultValue={valeursInitiales?.nomComplet}
          required
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        <input
          name="telephone"
          placeholder="Téléphone"
          defaultValue={valeursInitiales?.telephone}
          required
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="ville"
          placeholder="Ville"
          defaultValue={valeursInitiales?.ville}
          required
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        <input
          name="quartier"
          placeholder="Quartier"
          defaultValue={valeursInitiales?.quartier}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>
      <input
        name="adresseDetail"
        placeholder="Adresse détaillée (rue, point de repère...)"
        defaultValue={valeursInitiales?.adresseDetail}
        required
        className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
      />
      <input
        name="instructions"
        placeholder="Instructions de livraison (optionnel)"
        defaultValue={valeursInitiales?.instructions}
        className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
      />

      {erreur && <p className="text-xs text-vivrebio-rouge">{erreur}</p>}

      <Button type="submit" disabled={chargement}>
        {chargement ? "Enregistrement..." : "Continuer vers le paiement"}
      </Button>
    </form>
  );
}