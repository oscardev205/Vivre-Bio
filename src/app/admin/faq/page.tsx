// src/app/admin/faq/page.tsx
// Fichier complet : question/badge sur une ligne, icônes d'action en dessous
// et bien espacées sur mobile plutôt que compressées à droite.
"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type FaqItem = { id: string; question: string; reponse: string; ordre: number; publie: boolean };

export default function AdminFaqPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [afficherAjout, setAfficherAjout] = useState(false);
  const [questionAjout, setQuestionAjout] = useState("");
  const [reponseAjout, setReponseAjout] = useState("");
  const [chargement, setChargement] = useState(false);

  const [idEnEdition, setIdEnEdition] = useState<string | null>(null);
  const [questionEdition, setQuestionEdition] = useState("");
  const [reponseEdition, setReponseEdition] = useState("");

  async function charger() {
    const res = await fetch("/api/admin/faq");
    if (res.ok) setItems(await res.json());
  }

  useEffect(() => { charger(); }, []);

  async function handleAjout(e: React.FormEvent) {
    e.preventDefault();
    if (!questionAjout.trim() || !reponseAjout.trim()) return;
    setChargement(true);
    await fetch("/api/admin/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: questionAjout, reponse: reponseAjout }),
    });
    setChargement(false);
    setQuestionAjout("");
    setReponseAjout("");
    setAfficherAjout(false);
    await charger();
  }

  function ouvrirEdition(item: FaqItem) {
    setIdEnEdition(item.id);
    setQuestionEdition(item.question);
    setReponseEdition(item.reponse);
  }

  async function enregistrerEdition(id: string) {
    await fetch(`/api/admin/faq/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: questionEdition, reponse: reponseEdition }),
    });
    setIdEnEdition(null);
    await charger();
  }

  async function basculerPublication(item: FaqItem) {
    await fetch(`/api/admin/faq/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publie: !item.publie }),
    });
    await charger();
  }

  async function supprimer(id: string) {
    await fetch(`/api/admin/faq/${id}`, { method: "DELETE" });
    await charger();
  }

  async function deplacer(index: number, direction: -1 | 1) {
    const voisin = items[index + direction];
    if (!voisin) return;
    const courant = items[index];

    await Promise.all([
      fetch(`/api/admin/faq/${courant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ordre: voisin.ordre }),
      }),
      fetch(`/api/admin/faq/${voisin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ordre: courant.ordre }),
      }),
    ]);
    await charger();
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-encre">{items.length} question(s)</p>
        <button onClick={() => setAfficherAjout((v) => !v)} className="text-left text-xs text-vivrebio-vert hover:underline sm:text-right">
          {afficherAjout ? "Annuler" : "+ Ajouter une question"}
        </button>
      </div>

      {afficherAjout && (
        <form onSubmit={handleAjout} className="carte-3d mb-6 flex flex-col gap-3 p-4 sm:p-5">
          <input
            value={questionAjout}
            onChange={(e) => setQuestionAjout(e.target.value)}
            placeholder="Question"
            required
            className="rounded-lg border border-sable px-3 py-2 text-sm"
          />
          <textarea
            value={reponseAjout}
            onChange={(e) => setReponseAjout(e.target.value)}
            placeholder="Réponse"
            required
            rows={3}
            className="rounded-lg border border-sable px-3 py-2 text-sm"
          />
          <Button type="submit" disabled={chargement} className="w-full sm:w-fit">
            {chargement ? "Ajout..." : "Ajouter"}
          </Button>
        </form>
      )}

      <div className="carte-3d divide-y divide-sable">
        {items.map((item, i) => (
          <div key={item.id} className="p-4">
            {idEnEdition === item.id ? (
              <div className="flex flex-col gap-2">
                <input
                  value={questionEdition}
                  onChange={(e) => setQuestionEdition(e.target.value)}
                  className="rounded-lg border border-sable px-3 py-2 text-sm"
                />
                <textarea
                  value={reponseEdition}
                  onChange={(e) => setReponseEdition(e.target.value)}
                  rows={3}
                  className="rounded-lg border border-sable px-3 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <button onClick={() => enregistrerEdition(item.id)} className="rounded-lg bg-vivrebio-vert px-3 py-1.5 text-xs font-medium text-white">
                    Enregistrer
                  </button>
                  <button onClick={() => setIdEnEdition(null)} className="text-xs text-encre/40">Annuler</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-encre">{item.question}</p>
                    <Badge variant={item.publie ? "vert" : "gris"}>{item.publie ? "Publié" : "Masqué"}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-encre/60">{item.reponse}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={() => deplacer(i, -1)} disabled={i === 0} aria-label="Monter" className="text-encre/40 hover:text-vivrebio-vert disabled:opacity-20">
                    <ArrowUp size={14} />
                  </button>
                  <button onClick={() => deplacer(i, 1)} disabled={i === items.length - 1} aria-label="Descendre" className="text-encre/40 hover:text-vivrebio-vert disabled:opacity-20">
                    <ArrowDown size={14} />
                  </button>
                  <button onClick={() => ouvrirEdition(item)} aria-label="Modifier" className="text-encre/40 hover:text-vivrebio-vert">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => basculerPublication(item)} className="text-xs font-medium text-vivrebio-vert hover:underline">
                    {item.publie ? "Masquer" : "Publier"}
                  </button>
                  <button onClick={() => supprimer(item.id)} aria-label="Supprimer" className="text-vivrebio-rouge/60 hover:text-vivrebio-rouge">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && <p className="p-6 text-center text-sm text-encre/40">Aucune question pour l&apos;instant.</p>}
      </div>
    </div>
  );
}