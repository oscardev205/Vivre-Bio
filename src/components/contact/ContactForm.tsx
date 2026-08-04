// src/components/contact/ContactForm.tsx
// Fichier complet : ajout du champ honeypot invisible.
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ChampHoneypot } from "@/components/ui/ChampHoneypot";

export function ContactForm() {
  const [chargement, setChargement] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setChargement(true);
    setErreur("");

    const formData = new FormData(form);
    const payload = {
      nom: formData.get("nom"),
      email: formData.get("email"),
      message: formData.get("message"),
      site_web: formData.get("site_web"),
    };

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setChargement(false);

    if (!res.ok) {
      const data = await res.json();
      setErreur(data.erreur || "Une erreur est survenue, réessaie dans un instant.");
      return;
    }

    setEnvoye(true);
    form.reset();
  }

  if (envoye) {
    return (
      <div className="carte-3d p-6">
        <p className="text-sm text-encre">
          Merci, votre message a bien été envoyé — nous vous répondrons rapidement.
        </p>
      </div>
    );
  }

  return (
    <div className="carte-3d p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <ChampHoneypot />
        <input name="nom" placeholder="Votre nom" required className="rounded-lg border border-sable px-3 py-2.5 text-sm" />
        <input name="email" type="email" placeholder="Votre e-mail" required className="rounded-lg border border-sable px-3 py-2.5 text-sm" />
        <textarea name="message" placeholder="Votre message" required rows={5} className="rounded-lg border border-sable px-3 py-2.5 text-sm" />
        {erreur && <p className="text-xs text-vivrebio-rouge">{erreur}</p>}
        <Button type="submit" disabled={chargement}>
          {chargement ? "Envoi..." : "Envoyer le message"}
        </Button>
      </form>
    </div>
  );
}