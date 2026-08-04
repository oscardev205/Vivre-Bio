// src/app/connexion/page.tsx
// Fichier complet : distingue désormais le message de blocage (trop de tentatives)
// du message générique "mot de passe incorrect", au lieu d'écraser toujours
// l'erreur réelle par le même texte.
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function ConnexionPage() {
  const router = useRouter();
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChargement(true);
    setErreur("");

    const formData = new FormData(e.currentTarget);
    const resultat = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setChargement(false);

    if (resultat?.error) {
      // "CredentialsSignin" est le code renvoyé par NextAuth quand authorize()
      // retourne null (mauvais mot de passe) — tout autre message est le nôtre,
      // levé volontairement (ex: le blocage anti force-brute).
      if (resultat.error === "CredentialsSignin") {
        setErreur("E-mail ou mot de passe incorrect");
      } else {
        setErreur(resultat.error);
      }
    } else {
      router.push("/commande");
    }
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <div className="carte-3d-forte p-7">
        <h1 className="mb-6 text-xl font-semibold text-vivrebio-vert">Se connecter</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input name="email" type="email" placeholder="E-mail" required className="rounded-lg border border-sable px-3 py-2 text-sm" />
          <input name="password" type="password" placeholder="Mot de passe" required className="rounded-lg border border-sable px-3 py-2 text-sm" />
          {erreur && <p className="text-xs text-vivrebio-rouge">{erreur}</p>}
          <Button type="submit" disabled={chargement}>
            {chargement ? "Connexion..." : "Se connecter"}
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-encre/50">
          Pas encore de compte ? <a href="/inscription" className="text-vivrebio-vert">S&apos;inscrire</a>
        </p>
        <p className="mt-2 text-center text-xs">
  <a href="/mot-de-passe-oublie" className="text-encre/50 hover:text-vivrebio-vert">Mot de passe oublié ?</a>
</p>
      </div>
    </main>
  );
}