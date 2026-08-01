// src/app/connexion/page.tsx
// Le formulaire est désormais posé sur une carte 3D (.carte-3d-forte).
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
      setErreur("E-mail ou mot de passe incorrect");
    } else {
      router.push("/commande");
    }
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <div className="carte-3d-forte p-7">
        <h1 className="mb-6 text-xl font-semibold text-vivrebio-vert">Se connecter</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input name="email" type="email" placeholder="E-mail" required className="rounded-lg border border-sable px-3 py-2.5 text-sm" />
          <input name="password" type="password" placeholder="Mot de passe" required className="rounded-lg border border-sable px-3 py-2.5 text-sm" />
          {erreur && <p className="text-xs text-vivrebio-rouge">{erreur}</p>}
          <Button type="submit" disabled={chargement}>
            {chargement ? "Connexion..." : "Se connecter"}
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-encre/50">
          Pas encore de compte ? <a href="/inscription" className="text-vivrebio-vert">S&apos;inscrire</a>
        </p>
      </div>
    </main>
  );
}