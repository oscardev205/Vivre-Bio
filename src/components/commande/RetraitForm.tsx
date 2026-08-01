// src/components/commande/RetraitForm.tsx
// Ajout du paramètre valeurTelephoneInitiale, pour ne plus redemander le
// téléphone à un client connecté qui l'a déjà renseigné sur son compte.
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type Props = {
  onSubmit: (contact: { nomComplet: string; telephone: string }) => void;
  chargement?: boolean;
  valeurNomInitiale?: string;
  valeurTelephoneInitiale?: string;
};

export function RetraitForm({ onSubmit, chargement, valeurNomInitiale, valeurTelephoneInitiale }: Props) {
  const [erreur, setErreur] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nomComplet = String(formData.get("nomComplet") || "");
    const telephone = String(formData.get("telephone") || "");

    if (!nomComplet || !telephone) {
      setErreur("Merci de renseigner votre nom et votre téléphone.");
      return;
    }
    setErreur("");
    onSubmit({ nomComplet, telephone });
  }

  return (
    <div className="carte-3d p-6">
      <p className="mb-3 text-sm text-encre/60">
        Votre commande sera préparée et vous pourrez venir la récupérer directement en boutique, sans frais de livraison.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input name="nomComplet" placeholder="Nom complet" defaultValue={valeurNomInitiale} required className="rounded-lg border border-sable px-3 py-2.5 text-sm" />
        <input name="telephone" placeholder="Téléphone" defaultValue={valeurTelephoneInitiale} required className="rounded-lg border border-sable px-3 py-2.5 text-sm" />
        {erreur && <p className="text-xs text-vivrebio-rouge">{erreur}</p>}
        <Button type="submit" disabled={chargement}>
          {chargement ? "Enregistrement..." : "Continuer vers le paiement"}
        </Button>
      </form>
    </div>
  );
}