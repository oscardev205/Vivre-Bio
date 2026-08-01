// src/app/admin/demandes-livraison/page.tsx
// Fichier complet : les champs d'approbation (frais/délai) passent en colonne
// sur mobile, plus lisibles qu'alignés sur une ligne trop étroite.
"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";

type Demande = {
  id: string; ville: string; nom: string; telephone: string; email: string | null;
  statut: "EN_ATTENTE" | "APPROUVEE" | "REFUSEE"; createdAt: string;
};

export default function AdminDemandesLivraisonPage() {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [demandeActive, setDemandeActive] = useState<string | null>(null);
  const [frais, setFrais] = useState("");
  const [delai, setDelai] = useState("");

  async function charger() {
    const res = await fetch("/api/admin/demandes-livraison");
    if (res.ok) setDemandes(await res.json());
  }

  useEffect(() => { charger(); }, []);

  async function approuver(id: string) {
    if (!frais) return;
    await fetch(`/api/admin/demandes-livraison/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approuver", frais, delaiEstime: delai }),
    });
    setDemandeActive(null);
    setFrais("");
    setDelai("");
    await charger();
  }

  async function refuser(id: string) {
    await fetch(`/api/admin/demandes-livraison/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "refuser" }),
    });
    await charger();
  }

  const statutBadge = { EN_ATTENTE: "gris", APPROUVEE: "vert", REFUSEE: "rouge" } as const;

  return (
    <div>
      <p className="mb-4 text-sm font-medium text-encre">Demandes de zones de livraison</p>

      <div className="carte-3d divide-y divide-sable">
        {demandes.map((d) => (
          <div key={d.id} className="p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-encre">{d.ville}</p>
                <p className="text-xs text-encre/40">{d.nom} · {d.telephone}{d.email ? ` · ${d.email}` : ""}</p>
              </div>
              <Badge variant={statutBadge[d.statut]}>{d.statut}</Badge>
            </div>

            {d.statut === "EN_ATTENTE" && (
              <div className="mt-3">
                {demandeActive === d.id ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <input value={frais} onChange={(e) => setFrais(e.target.value)} type="number" placeholder="Frais (FCFA)" className="w-full rounded-lg border border-sable px-3 py-1.5 text-xs sm:w-32" />
                    <input value={delai} onChange={(e) => setDelai(e.target.value)} placeholder="Délai (ex: 48h)" className="w-full rounded-lg border border-sable px-3 py-1.5 text-xs sm:w-32" />
                    <div className="flex gap-2">
                      <button onClick={() => approuver(d.id)} className="rounded-lg bg-vivrebio-vert px-3 py-1.5 text-xs font-medium text-white">Confirmer</button>
                      <button onClick={() => setDemandeActive(null)} className="text-xs text-encre/40">Annuler</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 text-xs">
                    <button onClick={() => setDemandeActive(d.id)} className="font-medium text-vivrebio-vert hover:underline">Approuver</button>
                    <button onClick={() => refuser(d.id)} className="font-medium text-vivrebio-rouge hover:underline">Refuser</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {demandes.length === 0 && <p className="p-6 text-center text-sm text-encre/40">Aucune demande pour l&apos;instant.</p>}
      </div>
    </div>
  );
}