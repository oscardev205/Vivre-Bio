// src/components/messagerie/FilDiscussion.tsx
// Fichier complet : même correction que FilDiscussionParrainage — évite le
// même bug potentiel de défilement de toute la page.
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send } from "lucide-react";

type Message = {
  id: string;
  auteur: "CLIENT" | "ADMIN";
  contenu: string;
  createdAt: string;
};

export function FilDiscussion({ numero }: { numero: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [texte, setTexte] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [charge, setCharge] = useState(false);
  const conteneurRef = useRef<HTMLDivElement>(null);

  const charger = useCallback(async () => {
    const res = await fetch(`/api/commandes/${numero}/messages`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
    }
    setCharge(true);
  }, [numero]);

  useEffect(() => {
    charger();
  }, [charger]);

  useEffect(() => {
    if (conteneurRef.current) {
      conteneurRef.current.scrollTop = conteneurRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleEnvoi(e: React.FormEvent) {
    e.preventDefault();
    if (!texte.trim()) return;

    setEnvoi(true);
    const res = await fetch(`/api/commandes/${numero}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contenu: texte }),
    });

    if (res.ok) {
      setTexte("");
      await charger();
    }
    setEnvoi(false);
  }

  return (
    <div className="carte-3d flex min-w-0 flex-col p-4">
      <p className="mb-3 text-sm font-medium text-encre">Messages sur cette commande</p>

      <div ref={conteneurRef} className="flex max-h-72 min-w-0 flex-col gap-2 overflow-y-auto pr-1 scroll-smooth">
        {!charge && <p className="text-xs text-encre/40">Chargement...</p>}
        {charge && messages.length === 0 && (
          <p className="text-xs text-encre/40">Aucun message pour l&apos;instant.</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] min-w-0 rounded-2xl px-3.5 py-2 text-sm break-words ${
              m.auteur === "ADMIN"
                ? "self-start bg-vert-pale text-encre"
                : "self-end bg-vivrebio-vert text-white"
            }`}
          >
            <p>{m.contenu}</p>
            <p className={`mt-1 text-[10px] ${m.auteur === "ADMIN" ? "text-encre/40" : "text-white/70"}`}>
              {m.auteur === "ADMIN" ? "Vivre Bio" : "Vous"} ·{" "}
              {new Date(m.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleEnvoi} className="mt-3 flex min-w-0 gap-2 border-t border-sable pt-3">
        <input
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="Écrire un message..."
          className="min-w-0 flex-1 rounded-lg border border-sable px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={envoi || !texte.trim()}
          className="flex shrink-0 items-center justify-center rounded-lg bg-vivrebio-vert px-3.5 text-white disabled:opacity-40"
          aria-label="Envoyer"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}