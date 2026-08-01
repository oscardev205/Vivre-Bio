// src/app/admin/zones-livraison/page.tsx
// Fichier complet : même traitement — formulaire empilé, actions passent
// à la ligne proprement sur mobile.
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrix } from "@/lib/format";

type Zone = { id: string; ville: string; frais: number; delaiEstime: string | null; actif: boolean };

export default function AdminZonesLivraisonPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [afficherForm, setAfficherForm] = useState(false);
  const [chargement, setChargement] = useState(false);

  async function charger() {
    const res = await fetch("/api/admin/zones-livraison");
    if (res.ok) setZones(await res.json());
  }

  useEffect(() => { charger(); }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChargement(true);
    const formData = new FormData(e.currentTarget);
    await fetch("/api/admin/zones-livraison", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ville: formData.get("ville"),
        frais: formData.get("frais"),
        delaiEstime: formData.get("delaiEstime"),
      }),
    });
    setChargement(false);
    setAfficherForm(false);
    await charger();
  }

  async function basculerActif(zone: Zone) {
    await fetch(`/api/admin/zones-livraison/${zone.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actif: !zone.actif }),
    });
    await charger();
  }

  async function supprimer(id: string) {
    await fetch(`/api/admin/zones-livraison/${id}`, { method: "DELETE" });
    await charger();
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-encre">Zones de livraison</p>
        <button onClick={() => setAfficherForm((v) => !v)} className="text-left text-xs text-vivrebio-vert hover:underline sm:text-right">
          {afficherForm ? "Annuler" : "+ Nouvelle zone"}
        </button>
      </div>

      <p className="mb-4 rounded-lg bg-vert-pale px-3 py-2 text-xs text-encre/70">
        💡 Toute ville non listée ici recevra automatiquement des frais par défaut de {formatPrix(2000)}.
      </p>

      {afficherForm && (
        <form onSubmit={handleSubmit} className="carte-3d mb-6 flex flex-col gap-3 p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <input name="ville" placeholder="Ville (ex: Cotonou)" required className="rounded-lg border border-sable px-3 py-2 text-sm" />
            <input name="frais" type="number" placeholder="Frais (FCFA)" required className="rounded-lg border border-sable px-3 py-2 text-sm" />
            <input name="delaiEstime" placeholder="Délai estimé (ex: 24-48h)" className="rounded-lg border border-sable px-3 py-2 text-sm" />
          </div>
          <Button type="submit" disabled={chargement} className="w-full sm:w-fit">
            {chargement ? "Création..." : "Ajouter la zone"}
          </Button>
        </form>
      )}

      <div className="carte-3d divide-y divide-sable">
        {zones.map((zone) => (
          <div key={zone.id} className="flex flex-col gap-2 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-medium text-encre">{zone.ville}</p>
              <p className="text-xs text-encre/40">
                {formatPrix(zone.frais)}{zone.delaiEstime ? ` · ${zone.delaiEstime}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <Badge variant={zone.actif ? "vert" : "gris"}>{zone.actif ? "Active" : "Inactive"}</Badge>
              <button onClick={() => basculerActif(zone)} className="text-xs text-vivrebio-vert hover:underline">
                {zone.actif ? "Désactiver" : "Activer"}
              </button>
              <button onClick={() => supprimer(zone.id)} className="text-xs text-vivrebio-rouge hover:underline">
                Supprimer
              </button>
            </div>
          </div>
        ))}
        {zones.length === 0 && <p className="p-6 text-center text-sm text-encre/40">Aucune zone configurée.</p>}
      </div>
    </div>
  );
}