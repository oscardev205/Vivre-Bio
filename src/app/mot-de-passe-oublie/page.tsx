// src/app/mot-de-passe-oublie/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [chargement, setChargement] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);

    await fetch("/api/mot-de-passe-oublie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setChargement(false);
    setEnvoye(true); // toujours affiché, que le compte existe ou non
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <div className="carte-3d-forte p-7">
        <h1 className="mb-4 text-xl font-semibold text-vivrebio-vert">Mot de passe oublié</h1>

        {envoye ? (
          <p className="text-sm text-encre/70">
            Si un compte existe avec cet e-mail, un lien de réinitialisation vient de lui être envoyé.
            Vérifiez votre boîte de réception (et vos spams).
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <p className="text-sm text-encre/60">
              Indiquez votre e-mail, nous vous enverrons un lien pour choisir un nouveau mot de passe.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre e-mail"
              required
              className="rounded-lg border border-sable px-3 py-2.5 text-sm"
            />
            <Button type="submit" disabled={chargement}>
              {chargement ? "Envoi..." : "Envoyer le lien"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}