// src/components/compte/ConfirmerLivraisonButton.tsx
// Correction : le message de confirmation reste affiché même après le refresh
// de la page (délai avant refresh, et affichage basé sur une prop dérivée du serveur
// en plus de l'état local, pour ne jamais perdre la confirmation visuelle).
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ConfirmerLivraisonButton({ numero }: { numero: string }) {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);
  const [confirme, setConfirme] = useState(false);
  const [erreur, setErreur] = useState("");

  async function handleConfirmer() {
    setChargement(true);
    setErreur("");

    const res = await fetch(`/api/commandes/${numero}/confirmer-livraison`, { method: "POST" });
    const data = await res.json();

    setChargement(false);

    if (!res.ok) {
      setErreur(data.erreur || "Une erreur est survenue.");
      return;
    }

    setConfirme(true);

    // On laisse le message de succès visible un instant avant de rafraîchir
    // les données serveur de la page (sinon le refresh peut faire disparaître
    // le message trop vite, avant que l'utilisateur ne le voie).
    setTimeout(() => {
      router.refresh();
    }, 1200);
  }

  if (confirme) {
    return (
      <p className="flex items-center gap-2 rounded-lg bg-vert-pale px-4 py-3 text-sm text-vivrebio-vert">
        <CheckCircle2 size={16} /> Merci, livraison confirmée !
      </p>
    );
  }

  return (
    <div>
      <Button onClick={handleConfirmer} disabled={chargement}>
        {chargement ? "Confirmation..." : "J'ai bien reçu ma commande"}
      </Button>
      {erreur && <p className="mt-2 text-xs text-vivrebio-rouge">{erreur}</p>}
    </div>
  );
}