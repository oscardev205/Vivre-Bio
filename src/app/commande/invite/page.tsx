// src/app/commande/invite/page.tsx
// Tunnel invité : coordonnées + adresse, puis création de la commande et redirection vers le paiement.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { AddressForm, AdresseData } from "@/components/commande/AddressForm";

export default function CommandeInvitePage() {
  const router = useRouter();
  const { items, sousTotal, viderPanier } = useCart();
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  async function handleAdresseValidee(adresse: AdresseData) {
    if (!nom || !email || !telephone) {
      setErreur("Merci de renseigner vos coordonnées avant de continuer.");
      return;
    }
    setChargement(true);
    setErreur("");

    const res = await fetch("/api/commandes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, quantite: i.quantite })),
        adresse,
        invite: { nom, email, telephone },
        modePaiement: "mobile_money",
      }),
    });

    const data = await res.json();
    setChargement(false);

    if (!res.ok) {
      setErreur(data.erreur || "Une erreur est survenue.");
      return;
    }

    viderPanier();
    router.push(`/commande/paiement/${data.numero}`);
  }

  if (items.length === 0) {
    return <p className="mx-auto max-w-md px-4 py-16 text-center text-gray-500">Votre panier est vide.</p>;
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <p className="mb-6 text-xs text-gray-400">1. Panier → 2. Identification → 3. Livraison → 4. Paiement</p>
      <h1 className="mb-6 text-lg font-semibold text-vivrebio-vert">Vos coordonnées</h1>

      <div className="mb-6 grid gap-3">
        <input
          placeholder="Nom complet"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        <input
          placeholder="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        <input
          placeholder="Téléphone"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>

      <h2 className="mb-3 text-sm font-medium">Adresse de livraison</h2>
      <AddressForm onSubmit={handleAdresseValidee} chargement={chargement} />

      {erreur && <p className="mt-3 text-xs text-vivrebio-rouge">{erreur}</p>}

      <p className="mt-4 text-xs text-gray-400">Sous-total : {sousTotal.toLocaleString("fr-FR")} FCFA</p>
    </main>
  );
}