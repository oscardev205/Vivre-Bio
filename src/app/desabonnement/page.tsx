// src/app/desabonnement/page.tsx
// Page de désabonnement simple — accessible librement, sans connexion requise
// (une personne inscrite via le footer n'a pas forcément de compte sur le site).
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TraitFeuille } from "@/components/ui/TraitFeuille";

export default function DesabonnementPage() {
  const [email, setEmail] = useState("");
  const [chargement, setChargement] = useState(false);
  const [confirme, setConfirme] = useState(false);
  const [erreur, setErreur] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    setErreur("");

    const res = await fetch("/api/newsletter/desabonnement", {
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

    setConfirme(true);
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-wide text-vivrebio-rouge">
        Newsletter
      </p>
      <h1 className="mt-1 text-xl font-bold text-encre">Se désabonner</h1>
      <TraitFeuille className="mt-2" />

      {confirme ? (
        <div className="carte-3d mt-6 p-5">
          <p className="text-sm text-encre">
            Votre adresse a bien été retirée de notre liste. Vous ne recevrez plus nos e-mails.
          </p>
        </div>
      ) : (
        <div className="carte-3d mt-6 p-5">
          <p className="mb-4 text-sm text-encre/60">
            Indiquez l&apos;adresse e-mail à désinscrire de la newsletter Vivre Bio.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre e-mail"
              required
              className="rounded-lg border border-sable px-3 py-2.5 text-sm"
            />
            {erreur && <p className="text-xs text-vivrebio-rouge">{erreur}</p>}
            <Button type="submit" disabled={chargement}>
              {chargement ? "Traitement..." : "Se désabonner"}
            </Button>
          </form>
        </div>
      )}
    </main>
  );
}