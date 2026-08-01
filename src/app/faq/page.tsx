// src/app/faq/page.tsx
// Remplace le contenu existant de cette page (si elle existait déjà en statique)
// par une version connectée à la base de données.

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { TraitFeuille } from "@/components/ui/TraitFeuille";
import { Accordeon } from "@/components/ui/Accordeon";
import { FadeIn } from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Questions fréquentes sur nos produits, la livraison et le paiement.",
};

export default async function FaqPage() {
  const items = await prisma.faqItem.findMany({ where: { publie: true }, orderBy: { ordre: "asc" } });

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-vivrebio-rouge">Besoin d&apos;aide ?</p>
      <h1 className="mt-1 text-2xl font-bold text-encre">Questions fréquentes</h1>
      <TraitFeuille className="mt-2" />

      <div className="mt-8 flex flex-col gap-3">
        {items.map((item, i) => (
          <FadeIn key={item.id} delai={i * 60}>
            <Accordeon question={item.question} reponse={item.reponse} />
          </FadeIn>
        ))}
        {items.length === 0 && <p className="text-sm text-encre/40">Aucune question pour l&apos;instant.</p>}
      </div>
    </main>
  );
}