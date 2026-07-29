// src/components/commande/BoutonPaiementKkiapay.tsx
// Ajout d'un verrou (useRef) pour n'envoyer l'appel de vérification qu'une seule fois,
// même si l'écouteur Kkiapay se déclenche plusieurs fois côté navigateur.
"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

declare global {
  interface Window {
    openKkiapayWidget: (config: {
      amount: number;
      key: string;
      sandbox?: boolean;
      data?: string;
      position?: string;
    }) => void;
    addSuccessListener: (cb: (response: { transactionId: string }) => void) => void;
    removeSuccessListener: (cb: (response: { transactionId: string }) => void) => void;
  }
}

type Props = { numero: string; montant: number };
type EtatScript = "chargement" | "pret" | "erreur";

export function BoutonPaiementKkiapay({ numero, montant }: Props) {
  const router = useRouter();
  const [etat, setEtat] = useState<EtatScript>("chargement");
  const dejaEnvoye = useRef(false); // verrou anti-doublon

  useEffect(() => {
    const delai = setTimeout(() => {
      setEtat((etatActuel) => (etatActuel === "chargement" ? "erreur" : etatActuel));
    }, 8000);
    return () => clearTimeout(delai);
  }, []);

  useEffect(() => {
    function handleSuccess(response: { transactionId: string }) {
      if (dejaEnvoye.current) return; // ignore les déclenchements en double
      dejaEnvoye.current = true;

      fetch("/api/paiement/verifier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: response.transactionId, numero }),
      }).then(() => router.push(`/commande/confirmation/${numero}`));
    }

    if (etat === "pret") {
      window.addSuccessListener?.(handleSuccess);
    }
    return () => {
      if (etat === "pret") window.removeSuccessListener?.(handleSuccess);
    };
  }, [numero, router, etat]);

  function ouvrirPaiement() {
    if (etat !== "pret") return;
    window.openKkiapayWidget({
      amount: montant,
      key: process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY!,
      sandbox: true,
      data: numero,
      position: "center",
    });
  }

  return (
    <>
      <Script
        src="https://cdn.kkiapay.me/k.js"
        strategy="afterInteractive"
        onReady={() => setEtat("pret")}
        onError={() => setEtat("erreur")}
      />

      {etat === "erreur" ? (
        <div className="rounded-lg bg-red-50 p-3 text-center text-xs text-vivrebio-rouge">
          Le module de paiement n&apos;a pas pu se charger. Vérifie ta connexion, désactive
          temporairement ton bloqueur de publicités, puis{" "}
          <button onClick={() => location.reload()} className="underline">
            réessaie
          </button>.
        </div>
      ) : (
        <Button onClick={ouvrirPaiement} disabled={etat !== "pret"} className="w-full">
          {etat === "pret" ? `Payer ${montant.toLocaleString("fr-FR")} FCFA` : "Chargement du paiement..."}
        </Button>
      )}
    </>
  );
}