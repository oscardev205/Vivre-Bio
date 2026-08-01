// src/app/admin/promos/page.tsx
// Fichier complet : formulaire de création en 1 colonne sur mobile (3 sur sm+),
// chaque ligne de code promo empile infos/actions sur mobile au lieu de les
// aligner sur une seule ligne trop étroite.
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrix } from "@/lib/format";

type Promo = {
  id: string; code: string; type: "POURCENTAGE" | "MONTANT_FIXE"; valeur: number;
  actif: boolean; dateExpiration: string | null; utilisationMax: number | null;
  nombreUtilisations: number; montantMinimum: number | null;
};

function calculerStatut(p: Promo): { label: string; variant: "vert" | "rouge" | "gris" } {
  if (!p.actif) return { label: "Désactivé", variant: "gris" };
  if (p.dateExpiration && new Date(p.dateExpiration) < new Date()) {
    return { label: "Expiré", variant: "rouge" };
  }
  if (p.utilisationMax !== null && p.nombreUtilisations >= p.utilisationMax) {
    return { label: "Épuisé", variant: "gris" };
  }
  return { label: "Actif", variant: "vert" };
}

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [afficherForm, setAfficherForm] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [enCoursBascule, setEnCoursBascule] = useState<string | null>(null);

  async function charger() {
    const res = await fetch("/api/admin/promos");
    if (res.ok) setPromos(await res.json());
  }

  useEffect(() => { charger(); }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChargement(true);
    const formData = new FormData(e.currentTarget);
    await fetch("/api/admin/promos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: formData.get("code"),
        type: formData.get("type"),
        valeur: formData.get("valeur"),
        dateExpiration: formData.get("dateExpiration") || null,
        utilisationMax: formData.get("utilisationMax") || null,
        montantMinimum: formData.get("montantMinimum") || null,
      }),
    });
    setChargement(false);
    setAfficherForm(false);
    await charger();
  }

  async function basculerActif(promo: Promo) {
    setEnCoursBascule(promo.id);
    await fetch(`/api/admin/promos/${promo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actif: !promo.actif }),
    });
    setEnCoursBascule(null);
    await charger();
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-encre">Codes promo</p>
        <button onClick={() => setAfficherForm((v) => !v)} className="text-left text-xs text-vivrebio-vert hover:underline sm:text-right">
          {afficherForm ? "Annuler" : "+ Nouveau code"}
        </button>
      </div>

      {afficherForm && (
        <form onSubmit={handleSubmit} className="carte-3d mb-6 flex flex-col gap-3 p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="code" placeholder="CODE (ex: BIENVENUE10)" required className="rounded-lg border border-sable px-3 py-2 text-sm uppercase" />
            <select name="type" required className="rounded-lg border border-sable px-3 py-2 text-sm">
              <option value="POURCENTAGE">Pourcentage (%)</option>
              <option value="MONTANT_FIXE">Montant fixe (FCFA)</option>
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <input name="valeur" type="number" placeholder="Valeur" required className="rounded-lg border border-sable px-3 py-2 text-sm" />
            <input name="montantMinimum" type="number" placeholder="Panier minimum (optionnel)" className="rounded-lg border border-sable px-3 py-2 text-sm" />
            <input name="utilisationMax" type="number" placeholder="Nb utilisations max (optionnel)" className="rounded-lg border border-sable px-3 py-2 text-sm" />
          </div>
          <div>
            <input name="dateExpiration" type="date" className="rounded-lg border border-sable px-3 py-2 text-sm" />
            <p className="mt-1 text-[11px] text-encre/40">Le code reste valide jusqu&apos;à 23h59 le jour choisi.</p>
          </div>
          <Button type="submit" disabled={chargement} className="w-full sm:w-fit">
            {chargement ? "Création..." : "Créer le code"}
          </Button>
        </form>
      )}

      <div className="carte-3d divide-y divide-sable">
        {promos.map((p) => {
          const statut = calculerStatut(p);
          return (
            <div key={p.id} className="flex flex-col gap-2 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium text-encre">{p.code}</p>
                <p className="text-xs text-encre/40">
                  {p.type === "POURCENTAGE" ? `${p.valeur}%` : formatPrix(p.valeur)}
                  {p.montantMinimum ? ` · min. ${formatPrix(p.montantMinimum)}` : ""}
                  {" · "}{p.nombreUtilisations}/{p.utilisationMax ?? "∞"} utilisations
                  {p.dateExpiration ? ` · expire le ${new Date(p.dateExpiration).toLocaleDateString("fr-FR")}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Badge variant={statut.variant}>{statut.label}</Badge>
                <button
                  onClick={() => basculerActif(p)}
                  disabled={enCoursBascule === p.id}
                  className="text-xs font-medium text-vivrebio-vert hover:underline disabled:opacity-40"
                >
                  {p.actif ? "Désactiver" : "Réactiver"}
                </button>
              </div>
            </div>
          );
        })}
        {promos.length === 0 && <p className="p-6 text-center text-sm text-encre/40">Aucun code promo créé.</p>}
      </div>
    </div>
  );
}