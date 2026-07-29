// src/app/commande/adresse/page.tsx
// Tunnel connecté : l'utilisateur est déjà authentifié, on ne demande que l'adresse.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { AddressForm, AdresseData } from "@/components/commande/AddressForm";

export default function CommandeAdressePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, viderPanier } = useCart();
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  async function handleAdresseValidee(adresse: AdresseData) {
    setChargement(true);
    setErreur("");

    const res = await fetch("/api/commandes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, quantite: i.quantite })),
        adresse,
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

  if (!session) {
    return <p className="mx-auto max-w-md px-4 py-16 text-center text-gray-500">Veuillez vous connecter.</p>;
  }
  if (items.length === 0) {
    return <p className="mx-auto max-w-md px-4 py-16 text-center text-gray-500">Votre panier est vide.</p>;
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <p className="mb-6 text-xs text-gray-400">1. Panier → 2. Identification → 3. Livraison → 4. Paiement</p>
      <h1 className="mb-6 text-lg font-semibold text-vivrebio-vert">Adresse de livraison</h1>
      <AddressForm
        onSubmit={handleAdresseValidee}
        chargement={chargement}
        valeursInitiales={{ nomComplet: session.user?.name ?? "" }}
      />
      {erreur && <p className="mt-3 text-xs text-vivrebio-rouge">{erreur}</p>}
    </main>
  );
}