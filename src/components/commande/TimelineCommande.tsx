// src/components/commande/TimelineCommande.tsx
// Frise visuelle du statut de commande — remplace le simple texte "Statut : ..."
// par une vraie progression avec icônes, plus engageante et plus claire.

import { FaCircleCheck, FaBoxOpen, FaTruckFast, FaHouseCircleCheck, FaCircleXmark, FaClock } from "react-icons/fa6";

const ETAPES = [
  { cle: "PAYEE", label: "Payée", icon: FaCircleCheck },
  { cle: "EN_PREPARATION", label: "En préparation", icon: FaBoxOpen },
  { cle: "EXPEDIEE", label: "Expédiée", icon: FaTruckFast },
  { cle: "LIVREE", label: "Livrée", icon: FaHouseCircleCheck },
] as const;

export function TimelineCommande({ statut }: { statut: string }) {
  if (statut === "ANNULEE") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-vivrebio-rouge/10 px-4 py-3 text-sm text-vivrebio-rouge">
        <FaCircleXmark /> Commande annulée
      </div>
    );
  }

  if (statut === "EN_ATTENTE") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-encre/5 px-4 py-3 text-sm text-encre/60">
        <FaClock /> En attente de paiement
      </div>
    );
  }

  const indexActuel = ETAPES.findIndex((e) => e.cle === statut);

  return (
    <div className="flex items-center justify-between">
      {ETAPES.map((etape, i) => {
        const atteinte = i <= indexActuel;
        const Icon = etape.icon;
        return (
          <div key={etape.cle} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {i > 0 && (
                <div className={`h-0.5 flex-1 ${atteinte ? "bg-vivrebio-vert" : "bg-sable"}`} />
              )}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  atteinte ? "bg-vivrebio-vert text-white" : "bg-sable text-encre/30"
                } ${i === indexActuel ? "ring-4 ring-vert-pale" : ""}`}
              >
                <Icon size={13} />
              </div>
              {i < ETAPES.length - 1 && (
                <div className={`h-0.5 flex-1 ${i < indexActuel ? "bg-vivrebio-vert" : "bg-sable"}`} />
              )}
            </div>
            <p className={`mt-1.5 text-center text-[10px] font-medium ${atteinte ? "text-encre" : "text-encre/30"}`}>
              {etape.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}