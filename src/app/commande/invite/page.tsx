// src/app/commande/invite/page.tsx
// Fichier complet : ajout de pointsUtilises (récupéré via useCart, transmis
// à la création de commande), en plus de tout ce qui existait déjà.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { AddressForm, AdresseData } from "@/components/commande/AddressForm";
import { ModeLivraisonChoix } from "@/components/commande/ModeLivraisonChoix";
import { RetraitForm } from "@/components/commande/RetraitForm";

export default function CommandeInvitePage() {
  const router = useRouter();
  const { items, sousTotal, viderPanier, promo, pointsUtilises } = useCart();
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<"LIVRAISON" | "RETRAIT">("LIVRAISON");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  async function envoyerCommande(nom: string, telephone: string, reste: object) {
    if (!email.trim()) {
      setErreur("Merci de renseigner votre e-mail avant de continuer.");
      return;
    }
    setChargement(true);
    setErreur("");

    const res = await fetch("/api/commandes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...reste,
        invite: { nom, email, telephone },
        modePaiement: "mobile_money",
        codePromo: promo?.code,
        pointsUtilises,
      }),
    });

    let data: { erreur?: string; numero?: string } = {};
    try {
      data = await res.json();
    } catch {}

    setChargement(false);

    if (!res.ok) {
      setErreur(data.erreur || "Une erreur est survenue.");
      return;
    }

    viderPanier();
    router.push(`/commande/paiement/${data.numero}`);
  }

  function handleAdresseValidee(adresse: AdresseData) {
    envoyerCommande(adresse.nomComplet, adresse.telephone, {
      items: items.map((i) => ({ productId: i.productId, quantite: i.quantite })),
      adresse,
      modeLivraison: "LIVRAISON",
    });
  }

  function handleRetraitValide(contact: { nomComplet: string; telephone: string }) {
    envoyerCommande(contact.nomComplet, contact.telephone, {
      items: items.map((i) => ({ productId: i.productId, quantite: i.quantite })),
      modeLivraison: "RETRAIT",
      contactNom: contact.nomComplet,
      contactTelephone: contact.telephone,
    });
  }

  if (items.length === 0) {
    return <p className="mx-auto max-w-md px-4 py-16 text-center text-encre/50">Votre panier est vide.</p>;
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <p className="mb-6 text-xs text-encre/40">1. Panier → 2. Identification → 3. Livraison → 4. Paiement</p>
      <h1 className="mb-6 text-lg font-semibold text-vivrebio-vert">Votre commande</h1>

      <div className="mb-6">
        <input
          placeholder="Votre e-mail (pour la confirmation)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-sable px-3 py-2 text-sm"
        />
      </div>

      <ModeLivraisonChoix mode={mode} onChange={setMode} />

      {mode === "LIVRAISON" ? (
        <>
          <h2 className="mb-3 text-sm font-medium text-encre">Vos coordonnées et adresse de livraison</h2>
          <AddressForm onSubmit={handleAdresseValidee} chargement={chargement} emailInitial={email} />
        </>
      ) : (
        <RetraitForm onSubmit={handleRetraitValide} chargement={chargement} />
      )}

      {erreur && <p className="mt-3 text-xs text-vivrebio-rouge">{erreur}</p>}

      <p className="mt-4 text-xs text-encre/40">Sous-total : {sousTotal.toLocaleString("fr-FR")} FCFA</p>
    </main>
  );
}