// src/components/parrainage/FilDiscussionParrainage.tsx
// Fichier complet : ajoute nomAutre (affiché au-dessus de chaque message de
// l'interlocuteur, "Vous" pour ses propres messages), et une garde
// supplémentaire sur le nombre de messages pour éviter tout scrollTop
// redondant même si la boucle venait à se reproduire ailleurs.
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send } from "lucide-react";

type Message = { id: string; auteurId: string; contenu: string; createdAt: string };

export function FilDiscussionParrainage({
  autreId,
  monId,
  nomAutre,
  onCharge,
}: {
  autreId: string;
  monId: string;
  nomAutre: string;
  onCharge?: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [texte, setTexte] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const conteneurRef = useRef<HTMLDivElement>(null);
  const dernierNombreRef = useRef(0);

  const charger = useCallback(async () => {
    const res = await fetch(`/api/parrainage/messages/${autreId}`);
    if (res.ok) {
      setMessages(await res.json());
      onCharge?.();
    }
  }, [autreId, onCharge]);

  useEffect(() => { charger(); }, [charger]);

  // Ne force le défilement que si le NOMBRE de messages a réellement
  // augmenté — jamais sur un simple re-rendu sans nouveau message.
  useEffect(() => {
    if (conteneurRef.current && messages.length !== dernierNombreRef.current) {
      conteneurRef.current.scrollTop = conteneurRef.current.scrollHeight;
      dernierNombreRef.current = messages.length;
    }
  }, [messages]);

  async function handleEnvoi(e: React.FormEvent) {
    e.preventDefault();
    if (!texte.trim()) return;
    setEnvoi(true);
    const res = await fetch(`/api/parrainage/messages/${autreId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contenu: texte }),
    });
    if (res.ok) { setTexte(""); await charger(); }
    setEnvoi(false);
  }

  return (
    <div className="flex min-w-0 flex-col">
      <div ref={conteneurRef} className="flex max-h-64 min-w-0 flex-col gap-2 overflow-y-auto overscroll-contain pr-1 scroll-smooth">
        {messages.map((m) => {
          const deMoi = m.auteurId === monId;
          return (
            <div key={m.id} className={`flex max-w-[80%] min-w-0 flex-col ${deMoi ? "self-end items-end" : "self-start items-start"}`}>
              <p className="mb-0.5 px-1 text-[10px] font-medium text-encre/40">{deMoi ? "Vous" : nomAutre}</p>
              <div className={`min-w-0 rounded-2xl px-3.5 py-2 text-sm break-words ${deMoi ? "bg-vivrebio-vert text-white" : "bg-vert-pale text-encre"}`}>
                <p>{m.contenu}</p>
                <p className={`mt-1 text-[10px] ${deMoi ? "text-white/70" : "text-encre/40"}`}>
                  {new Date(m.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && <p className="text-xs text-encre/40">Aucun message pour l&apos;instant.</p>}
      </div>
      <form onSubmit={handleEnvoi} className="mt-3 flex min-w-0 gap-2 border-t border-sable pt-3">
        <input
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="Écrire un message..."
          className="min-w-0 flex-1 rounded-lg border border-sable px-3 py-2 text-sm"
        />
        <button type="submit" disabled={envoi || !texte.trim()} className="flex shrink-0 items-center justify-center rounded-lg bg-vivrebio-vert px-3.5 text-white disabled:opacity-40" aria-label="Envoyer">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}