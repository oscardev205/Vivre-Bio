// src/app/compte/parrainage/page.tsx
// Fichier complet : charger() est désormais stabilisée avec useCallback,
// ce qui casse la boucle infinie qui faisait sauter le défilement du chat
// en continu. Transmet aussi le nom de l'interlocuteur pour l'affichage clair
// de l'auteur dans chaque bulle.
"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Copy, RefreshCw, MessageCircle } from "lucide-react";
import { FilDiscussionParrainage } from "@/components/parrainage/FilDiscussionParrainage";

type InfosMessagerie = {
  dernierMessage: { contenu: string; deMoi: boolean; createdAt: string } | null;
  nonLus: number;
};
type Filleul = InfosMessagerie & { id: string; nom: string; email: string | null; inscritLe: string; totalPoints: number; nombreCommandes: number };
type MonParrain = InfosMessagerie & { id: string; nom: string };
type Donnees = { code: string; lien: string; filleuls: Filleul[]; monParrain: MonParrain | null; resume: { totalPointsGagnes: number; nombreFilleuls: number } };

function ApercuMessage({ info }: { info: InfosMessagerie }) {
  if (!info.dernierMessage) return null;
  return (
    <p className="mt-1 truncate text-xs text-encre/40">
      {info.dernierMessage.deMoi ? "Vous : " : ""}{info.dernierMessage.contenu}
    </p>
  );
}

export default function ParrainagePage() {
  const { data: session } = useSession();
  const [donnees, setDonnees] = useState<Donnees | null>(null);
  const [tri, setTri] = useState<"recent" | "rentable">("recent");
  const [copie, setCopie] = useState(false);
  const [reinitialisation, setReinitialisation] = useState(false);
  const [conversationOuverte, setConversationOuverte] = useState<string | null>(null);

  // Stabilisée : garde la même référence entre les rendus, tant que ses
  // dépendances (aucune ici) ne changent pas — casse la boucle infinie
  // provoquée par onCharge côté enfant.
  const charger = useCallback(async () => {
    const res = await fetch("/api/compte/parrainage");
    if (res.ok) setDonnees(await res.json());
  }, []);

  useEffect(() => { charger(); }, [charger]);

  function copierLien() {
    if (!donnees) return;
    navigator.clipboard.writeText(donnees.lien);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  }

  async function reinitialiserCode() {
    setReinitialisation(true);
    await fetch("/api/parrainage/reinitialiser", { method: "POST" });
    await charger();
    setReinitialisation(false);
  }

  function ouvrirConversation(id: string) {
    setConversationOuverte(conversationOuverte === id ? null : id);
  }

  if (!donnees) return <p className="text-sm text-encre/40">Chargement...</p>;

  const filleulsTries = [...donnees.filleuls].sort((a, b) =>
    tri === "rentable" ? b.totalPoints - a.totalPoints : new Date(b.inscritLe).getTime() - new Date(a.inscritLe).getTime()
  );

  return (
    <div>
      {donnees.monParrain && (
        <div className="carte-3d mb-6 p-5">
          <p className="mb-2 text-sm font-medium text-encre">Votre parrain</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-encre">{donnees.monParrain.nom}</p>
              <ApercuMessage info={donnees.monParrain} />
            </div>
            <button onClick={() => ouvrirConversation(donnees.monParrain!.id)} className="relative">
              <MessageCircle size={18} className="text-encre/40 hover:text-vivrebio-vert" />
              {donnees.monParrain.nonLus > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-vivrebio-rouge px-1 text-[10px] text-white">
                  {donnees.monParrain.nonLus}
                </span>
              )}
            </button>
          </div>
          {conversationOuverte === donnees.monParrain.id && session?.user && (
            <div className="mt-3 border-t border-sable pt-3">
              <FilDiscussionParrainage
                autreId={donnees.monParrain.id}
                monId={(session.user as { id: string }).id}
                nomAutre={donnees.monParrain.nom}
                onCharge={charger}
              />
            </div>
          )}
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="carte-3d-forte p-5 text-center">
          <p className="text-xs text-encre/40">Total gagné grâce à votre réseau</p>
          <p className="mt-1 text-2xl font-bold text-vivrebio-vert">{donnees.resume.totalPointsGagnes} points</p>
        </div>
        <div className="carte-3d-forte p-5 text-center">
          <p className="text-xs text-encre/40">Filleuls</p>
          <p className="mt-1 text-2xl font-bold text-encre">{donnees.resume.nombreFilleuls}</p>
        </div>
      </div>

      <div className="carte-3d mb-6 p-5">
        <p className="mb-2 text-sm font-medium text-encre">Votre code de parrainage</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-vert-pale px-3 py-1.5 font-mono text-sm font-semibold text-vivrebio-vert">{donnees.code}</span>
          <button onClick={copierLien} className="flex items-center gap-1.5 rounded-lg border border-sable px-3 py-1.5 text-xs text-encre/70 hover:border-vivrebio-vert">
            <Copy size={13} /> {copie ? "Copié !" : "Copier le lien"}
          </button>
          <button onClick={reinitialiserCode} disabled={reinitialisation} className="flex items-center gap-1.5 rounded-lg border border-sable px-3 py-1.5 text-xs text-encre/70 hover:border-vivrebio-rouge disabled:opacity-40">
            <RefreshCw size={13} /> {reinitialisation ? "..." : "Réinitialiser"}
          </button>
        </div>
        <p className="mt-2 break-all text-xs text-encre/40">{donnees.lien}</p>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-encre">Votre réseau</p>
        <div className="flex gap-2">
          <button onClick={() => setTri("recent")} className={`rounded-full border px-3 py-1 text-xs ${tri === "recent" ? "border-vivrebio-vert bg-vivrebio-vert text-white" : "border-sable text-encre/60"}`}>
            Plus récents
          </button>
          <button onClick={() => setTri("rentable")} className={`rounded-full border px-3 py-1 text-xs ${tri === "rentable" ? "border-vivrebio-vert bg-vivrebio-vert text-white" : "border-sable text-encre/60"}`}>
            Les plus rentables
          </button>
        </div>
      </div>

      <div className="carte-3d divide-y divide-sable">
        {filleulsTries.map((f) => (
          <div key={f.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-encre">{f.nom}</p>
                <p className="text-xs text-encre/40">
                  Inscrit le {new Date(f.inscritLe).toLocaleDateString("fr-FR")} · {f.nombreCommandes} commande(s)
                </p>
                <ApercuMessage info={f} />
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-semibold text-vivrebio-vert">+{f.totalPoints} pts</span>
                <button onClick={() => ouvrirConversation(f.id)} className="relative">
                  <MessageCircle size={16} className="text-encre/40 hover:text-vivrebio-vert" />
                  {f.nonLus > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-vivrebio-rouge px-1 text-[10px] text-white">
                      {f.nonLus}
                    </span>
                  )}
                </button>
              </div>
            </div>
            {conversationOuverte === f.id && session?.user && (
              <div className="mt-3 border-t border-sable pt-3">
                <FilDiscussionParrainage
                  autreId={f.id}
                  monId={(session.user as { id: string }).id}
                  nomAutre={f.nom}
                  onCharge={charger}
                />
              </div>
            )}
          </div>
        ))}
        {donnees.filleuls.length === 0 && (
          <p className="p-6 text-center text-sm text-encre/40">
            Aucun filleul pour l&apos;instant — partagez votre lien pour commencer à gagner des points !
          </p>
        )}
      </div>
    </div>
  );
}