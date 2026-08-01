// src/components/contact/ContactForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  const [chargement, setChargement] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChargement(true);
    setErreur("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      nom: formData.get("nom"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setChargement(false);

    if (!res.ok) {
      setErreur("Une erreur est survenue, réessaie dans un instant.");
      return;
    }

    setEnvoye(true);
    e.currentTarget.reset();
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