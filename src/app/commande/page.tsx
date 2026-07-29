// src/app/commande/page.tsx
// Seul le bloc "si déjà connecté" change : on redirige vers /commande/adresse au lieu d'un simple message.
"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";

export default function CommandePage() {
  const { data: session } = useSession();
  const { items } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (session) router.push("/commande/adresse");
  }, [session, router]);

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-gray-500">Votre panier est vide.</p>
        <Link href="/boutique"><Button className="mt-4">Découvrir la boutique</Button></Link>
      </main>
    );
  }

  if (session) return null; // redirection en cours

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <p className="mb-6 text-xs text-gray-400">1. Panier → 2. Identification → 3. Livraison → 4. Paiement</p>
      <h1 className="mb-6 text-lg font-semibold">Comment souhaitez-vous continuer ?</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border-2 border-vivrebio-vert p-4">
          <span className="mb-2 inline-block rounded-full bg-green-50 px-2 py-0.5 text-[10px] text-vivrebio-vert">
            Le plus rapide
          </span>
          <p className="text-sm font-medium">Continuer en invité</p>
          <p className="mt-1 text-xs text-gray-500">Commandez sans créer de compte.</p>
          <Link href="/commande/invite"><Button className="mt-3 w-full">Choisir</Button></Link>
        </div>
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-medium">Se connecter</p>
          <p className="mt-1 text-xs text-gray-500">Retrouvez vos adresses enregistrées.</p>
          <Link href="/connexion"><Button variant="outline" className="mt-3 w-full">Se connecter</Button></Link>
        </div>
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-medium">Créer un compte</p>
          <p className="mt-1 text-xs text-gray-500">Gagnez du temps la prochaine fois.</p>
          <Link href="/inscription"><Button variant="outline" className="mt-3 w-full">S&apos;inscrire</Button></Link>
        </div>
      </div>
    </main>
  );
}