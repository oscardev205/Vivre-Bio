// src/app/page.tsx
// Page d'accueil : bandeau hero + valeurs de marque + produits phares réels (depuis la base).

import Link from "next/link";
import { Leaf, Heart, Award, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/produits/ProductCard";
import { getProduitsPhares } from "@/lib/produits";

export default async function Home() {
  const produitsPhares = await getProduitsPhares(3);

  return (
    <main className="mx-auto max-w-6xl px-4">
      {/* Bandeau hero */}
      <section className="mt-6 rounded-2xl bg-green-50 p-8 text-center">
        <h1 className="text-2xl font-semibold text-vivrebio-vert">
          Le meilleur de la nature pour vous
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
          Huiles essentielles, huiles végétales, poudres, infusions et cosmétiques naturels.
        </p>
        <Link href="/boutique">
          <Button className="mt-4">Découvrir la boutique</Button>
        </Link>
      </section>

      {/* Valeurs de marque */}
      <section className="mt-8 grid grid-cols-2 gap-4 text-center md:grid-cols-4">
        <div>
          <Leaf className="mx-auto text-vivrebio-vert" />
          <p className="mt-1 text-xs font-medium">Naturel</p>
        </div>
        <div>
          <Heart className="mx-auto text-vivrebio-vert" />
          <p className="mt-1 text-xs font-medium">Santé</p>
        </div>
        <div>
          <Award className="mx-auto text-vivrebio-vert" />
          <p className="mt-1 text-xs font-medium">Authenticité</p>
        </div>
        <div>
          <Zap className="mx-auto text-vivrebio-vert" />
          <p className="mt-1 text-xs font-medium">Vitalité</p>
        </div>
      </section>

      {/* Produits phares (issus de la vraie base de données) */}
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">Nos produits phares</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {produitsPhares.map((produit) => (
            <ProductCard key={produit.id} produit={produit} />
          ))}
        </div>
      </section>
    </main>
  );
}