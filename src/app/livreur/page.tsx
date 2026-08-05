// src/app/livreur/page.tsx
// Fichier complet : récupère maintenant le vrai statut de disponibilité au
// chargement (au lieu de toujours démarrer à false), et le bouton est rendu
// plus clairement cliquable (icône + libellé d'action explicite).
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Power } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatPrix } from "@/lib/format";

type Livraison = {
  numero: string; statut: string; total: number;
  address: { ville: string; quartier: string } | null;
  user: { nom: string | null } | null;
};

export default function LivreurDashboard() {
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [disponible, setDisponible] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [chargementDispo, setChargementDispo] = useState(true);

  async function charger() {
    const res = await fetch("/api/livreur/livraisons");
    if (res.ok) setLivraisons(await res.json());
    setChargement(false);
  }

  async function chargerDisponibilite() {
    const res = await fetch("/api/livreur/disponibilite");
    if (res.ok) {
      const data = await res.json();
      setDisponible(data.disponible);
    }
    setChargementDispo(false);
  }

  useEffect(() => {
    charger();
    chargerDisponibilite();
  }, []);

  async function basculerDisponibilite() {
    const nouvelleValeur = !disponible;
    setDisponible(nouvelleValeur);
    await fetch("/api/livreur/disponibilite", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disponible: nouvelleValeur }),
    });
  }

  const enCours = livraisons.filter((l) => l.statut === "EXPEDIEE");
  const livrees = livraisons.filter((l) => l.statut === "LIVREE");

  return (
    <div>
      <div className="carte-3d mb-6 flex items-center justify-between p-4">
        <div>
          <p className="text-sm font-medium text-encre">Statut de disponibilité</p>
          <p className="text-xs text-encre/50">
            {chargementDispo
              ? "Chargement..."
              : disponible
                ? "Vous apparaissez dans la liste des livreurs disponibles"
                : "Vous n'apparaissez pas comme disponible — cliquez pour changer"}
          </p>
        </div>
        <button
          onClick={basculerDisponibilite}
          disabled={chargementDispo}
          className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-40 ${
            disponible ? "bg-vivrebio-vert" : "bg-vivrebio-rouge"
          }`}
        >
          <Power size={15} />
          {disponible ? "Disponible" : "Indisponible"}
        </button>
      </div>

      <p className="mb-2 text-sm font-medium text-encre">À livrer ({enCours.length})</p>
      <div className="carte-3d mb-6 divide-y divide-sable">
        {enCours.map((l) => (
          <Link key={l.numero} href={`/livreur/livraisons/${l.numero}`} className="flex items-center justify-between p-3 text-sm hover:bg-vert-pale">
            <div>
              <p className="font-medium text-encre">{l.numero}</p>
              <p className="text-xs text-encre/40">{l.address?.quartier}, {l.address?.ville}</p>
            </div>
            <span className="text-sm">{formatPrix(l.total)}</span>
          </Link>
        ))}
        {!chargement && enCours.length === 0 && <p className="p-4 text-center text-xs text-encre/40">Aucune livraison en cours.</p>}
      </div>

      <p className="mb-2 text-sm font-medium text-encre">Historique ({livrees.length})</p>
      <div className="carte-3d divide-y divide-sable">
        {livrees.slice(0, 10).map((l) => (
          <div key={l.numero} className="flex items-center justify-between p-3 text-sm">
            <span>{l.numero}</span>
            <Badge variant="vert">Livrée</Badge>
          </div>
        ))}
        {!chargement && livrees.length === 0 && <p className="p-4 text-center text-xs text-encre/40">Aucune livraison effectuée pour l'instant.</p>}
      </div>
    </div>
  );
}