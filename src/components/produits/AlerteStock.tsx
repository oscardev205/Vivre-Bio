// src/components/produits/AlerteStock.tsx
// Formulaire affiché uniquement quand le produit est en rupture — remplace
// le bouton "Ajouter au panier" désactivé par quelque chose d'utile.
"use client";

import { useState } from "react";

export function AlerteStock({ productId }: { productId: string }) {
  const [email, setEmail] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    setErreur("");

    const res = await fetch(`/api/produits/${productId}/alerte-stock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setChargement(false);

    if (!res.ok) {
      const data = await res.json();
      setErreur(data.erreur || "Une erreur est survenue.");
      return;
    }

    setEnvoye(true);
  }

  if (envoye) {
    return (
      <p className="rounded-lg bg-vert-pale px-4 py-3 text-sm text-vivrebio-vert">
        Merci, nous vous préviendrons dès que ce produit sera disponible.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <p className="text-xs font-medium text-encre">Produit en rupture — être prévenu(e) du retour en stock :</p>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre e-mail"
          className="flex-1 rounded-lg border border-sable px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={chargement}
          className="rounded-lg bg-vivrebio-vert px-4 text-sm font-medium text-white"
        >
          {chargement ? "..." : "M'alerter"}
        </button>
      </div>
      {erreur && <p className="text-xs text-vivrebio-rouge">{erreur}</p>}
    </form>
  );
}