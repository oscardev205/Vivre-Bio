// src/app/livraison/page.tsx
// Page d'information sur la livraison — corrige le lien du footer qui menait
// jusqu'ici vers une page inexistante (erreur 404).

import type { Metadata } from "next";
import { FaTruckFast, FaShop, FaMapLocationDot } from "react-icons/fa6";
import { TraitFeuille } from "@/components/ui/TraitFeuille";

export const metadata: Metadata = {
  title: "Livraison",
  description: "Modes de livraison, zones couvertes et retrait en boutique chez Vivre Bio.",
};

export default function LivraisonPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-vivrebio-rouge">Vos options</p>
      <h1 className="mt-1 text-2xl font-bold text-encre">Livraison &amp; retrait</h1>
      <TraitFeuille className="mt-2" />

      <div className="mt-8 space-y-4">
        <div className="carte-3d p-5">
          <div className="mb-2 flex items-center gap-2">
            <FaTruckFast className="text-vivrebio-vert" />
            <p className="text-sm font-semibold text-encre">Livraison à domicile</p>
          </div>
          <p className="text-sm text-encre/70">
            Choisissez précisément votre position sur la carte au moment de la commande. Les frais
            varient selon votre ville — ils sont indiqués clairement avant de valider votre commande.
          </p>
        </div>

        <div className="carte-3d p-5">
          <div className="mb-2 flex items-center gap-2">
            <FaShop className="text-vivrebio-vert" />
            <p className="text-sm font-semibold text-encre">Retrait en boutique</p>
          </div>
          <p className="text-sm text-encre/70">
            Gratuit et disponible pour toute commande — récupérez votre colis directement à la
            boutique, sans frais de livraison.
          </p>
        </div>

        <div className="carte-3d p-5">
          <div className="mb-2 flex items-center gap-2">
            <FaMapLocationDot className="text-vivrebio-vert" />
            <p className="text-sm font-semibold text-encre">Votre ville n&apos;est pas couverte ?</p>
          </div>
          <p className="text-sm text-encre/70">
            Lors de la commande, vous pouvez demander l&apos;ouverture d&apos;une nouvelle zone de
            livraison — nous vous préviendrons dès que ce sera possible.
          </p>
        </div>
      </div>
    </main>
  );
}