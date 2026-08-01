// src/components/layout/NewsletterForm.tsx
// Version fonctionnelle : envoie réellement l'e-mail à l'API, avec gestion
// d'erreur et confirmation visuelle.
"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    setErreur("");

    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
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
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre e-mail"
          className="flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-vivrebio-vert-clair focus:outline-none"
        />
        <button
          type="submit"
          disabled={chargement}
          className="rounded-lg bg-vivrebio-vert-clair px-4 py-2 text-sm font-medium text-encre transition hover:brightness-95 disabled:opacity-50"
        >
          {chargement ? "..." : "S'inscrire"}
        </button>
      </div>
      {erreur && <p className="text-xs text-vivrebio-rouge">{erreur}</p>}
    </form>
  );
}