// src/app/inscription/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function InscriptionPage() {
  const router = useRouter();
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChargement(true);
    setErreur("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      nom: formData.get("nom"),
      email: formData.get("email"),
      telephone: formData.get("telephone"),
      password: formData.get("password"),
    };

    const res = await fetch("/api/inscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      setErreur(data.erreur);
      setChargement(false);
      return;
    }

    await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });

    setChargement(false);
    router.push("/commande");
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <div className="carte-3d-forte p-7">
        <h1 className="mb-6 text-xl font-semibold text-vivrebio-vert">Créer un compte</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input name="nom" placeholder="Nom complet" required className="rounded-lg border border-sable px-3 py-2.5 text-sm" />
          <input name="email" type="email" placeholder="E-mail" required className="rounded-lg border border-sable px-3 py-2.5 text-sm" />
          <input name="telephone" placeholder="Téléphone" required className="rounded-lg border border-sable px-3 py-2.5 text-sm" />
          <input name="password" type="password" placeholder="Mot de passe" required minLength={6} className="rounded-lg border border-sable px-3 py-2.5 text-sm" />
          {erreur && <p className="text-xs text-vivrebio-rouge">{erreur}</p>}
          <Button type="submit" disabled={chargement}>
            {chargement ? "Création..." : "Créer mon compte"}
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-encre/50">
          Déjà client ? <a href="/connexion" className="text-vivrebio-vert">Se connecter</a>
        </p>
      </div>
    </main>
  );
}