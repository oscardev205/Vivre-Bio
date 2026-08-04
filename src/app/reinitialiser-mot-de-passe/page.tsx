// src/app/reinitialiser-mot-de-passe/page.tsx
"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PasswordChecklist } from "@/components/ui/PasswordChecklist";

export default function ReinitialiserMotDePassePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);
  const [succes, setSucces] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");

    if (motDePasse !== confirmation) {
      setErreur("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setChargement(true);
    const res = await fetch("/api/reinitialiser-mot-de-passe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, nouveauMotDePasse: motDePasse }),
    });
    const data = await res.json();
    setChargement(false);

    if (!res.ok) {
      setErreur(data.erreur || "Une erreur est survenue.");
      return;
    }

    setSucces(true);
    setTimeout(() => router.push("/connexion"), 2000);
  }

  if (!token) {
    return (
      <main className="mx-auto max-w-sm px-4 py-16">
        <div className="carte-3d-forte p-7">
          <p className="text-sm text-vivrebio-rouge">Lien invalide — aucun jeton fourni.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <div className="carte-3d-forte p-7">
        <h1 className="mb-6 text-xl font-semibold text-vivrebio-vert">Nouveau mot de passe</h1>

        {succes ? (
          <p className="text-sm text-vivrebio-vert">
            Mot de passe modifié avec succès — redirection vers la connexion...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              type="password"
              placeholder="Nouveau mot de passe"
              required
              className="rounded-lg border border-sable px-3 py-2.5 text-sm"
            />
            <PasswordChecklist motDePasse={motDePasse} />
            <input
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              type="password"
              placeholder="Confirmer le mot de passe"
              required
              className="rounded-lg border border-sable px-3 py-2.5 text-sm"
            />
            {erreur && <p className="text-xs text-vivrebio-rouge">{erreur}</p>}
            <Button type="submit" disabled={chargement}>
              {chargement ? "Enregistrement..." : "Réinitialiser le mot de passe"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}