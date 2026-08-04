// src/components/layout/NewsletterForm.tsx
// Fichier complet : ajout du honeypot.
"use client";

import { useState } from "react";
import { ChampHoneypot } from "@/components/ui/ChampHoneypot";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setChargement(true);
    setErreur("");

    const formData = new FormData(form);
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, site_web: formData.get("site_web") }),
    });

    setChargement(false);

    if (!res.ok) {
      const data = await res.json();
      setErreur(data.erreur || "Une erreur est survenue.");
      return;
    }

    setEnvoye(true);
    setEmail("");
  }

  if (envoye) {
    return <p className="text-sm text-vivrebio-vert-clair">Merci, vous êtes inscrit !</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
      <ChampHoneypot />
      <div className="flex flex-col gap-2 xs:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre e-mail"
          className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-vivrebio-vert-clair focus:outline-none"
        />
        <button
          type="submit"
          disabled={chargement}
          className="shrink-0 rounded-lg bg-vivrebio-vert-clair px-4 py-2 text-sm font-medium text-encre transition hover:brightness-95 disabled:opacity-50"
        >
          {chargement ? "..." : "S'inscrire"}
        </button>
      </div>
      {erreur && <p className="text-xs text-vivrebio-rouge">{erreur}</p>}
    </form>
  );
}