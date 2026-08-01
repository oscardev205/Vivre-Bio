// src/app/compte/layout.tsx
// Fichier complet : la nav passe en défilement horizontal propre sur mobile
// (au lieu de wrap désordonné ou débordement), verticale en colonne sur desktop.

import Link from "next/link";
import { LayoutDashboard, Package, MapPin, Settings, Heart, Gift } from "lucide-react";
import { DeconnexionButton } from "@/components/compte/DeconnexionButton";

export default function CompteLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <h1 className="mb-4 text-lg font-semibold text-vivrebio-vert sm:mb-6 sm:text-xl">Mon espace client</h1>

      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <aside className="w-full shrink-0 md:w-48">
          <nav className="flex gap-2 overflow-x-auto pb-2 text-sm md:flex-col md:gap-1 md:overflow-visible md:pb-0">
            <Link href="/compte" className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-sable px-3 py-2 hover:bg-vert-pale md:border-0 md:px-2 md:py-1.5">
              <LayoutDashboard size={16} /> Tableau de bord
            </Link>
            <Link href="/compte/commandes" className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-sable px-3 py-2 hover:bg-vert-pale md:border-0 md:px-2 md:py-1.5">
              <Package size={16} /> Mes commandes
            </Link>
            <Link href="/compte/adresses" className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-sable px-3 py-2 hover:bg-vert-pale md:border-0 md:px-2 md:py-1.5">
              <MapPin size={16} /> Mes adresses
            </Link>
            <Link href="/compte/favoris" className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-sable px-3 py-2 hover:bg-vert-pale md:border-0 md:px-2 md:py-1.5">
              <Heart size={16} /> Mes favoris
            </Link>
            <Link href="/compte/fidelite" className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-sable px-3 py-2 hover:bg-vert-pale md:border-0 md:px-2 md:py-1.5">
              <Gift size={16} /> Mes points
            </Link>
            <Link href="/compte/parametres" className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-sable px-3 py-2 hover:bg-vert-pale md:border-0 md:px-2 md:py-1.5">
              <Settings size={16} /> Paramètres
            </Link>
          </nav>
          <div className="mt-4 border-t border-sable pt-4">
            <DeconnexionButton />
          </div>
        </aside>

        <section className="min-w-0 flex-1">{children}</section>
      </div>
    </main>
  );
}