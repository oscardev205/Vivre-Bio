// src/app/compte/layout.tsx
// Layout partagé par toutes les pages de l'espace client : navigation latérale
// (tableau de bord, commandes, adresses) + bouton de déconnexion.

import Link from "next/link";
import { LayoutDashboard, Package, MapPin } from "lucide-react";
import { DeconnexionButton } from "@/components/compte/DeconnexionButton";

export default function CompteLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold text-vivrebio-vert">Mon espace client</h1>

      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="w-full shrink-0 md:w-48">
          <nav className="flex flex-row gap-4 text-sm md:flex-col md:gap-1">
            <Link href="/compte" className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-green-50">
              <LayoutDashboard size={16} /> Tableau de bord
            </Link>
            <Link href="/compte/commandes" className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-green-50">
              <Package size={16} /> Mes commandes
            </Link>
            <Link href="/compte/adresses" className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-green-50">
              <MapPin size={16} /> Mes adresses
            </Link>
          </nav>
          <div className="mt-4 border-t border-gray-100 pt-4">
            <DeconnexionButton />
          </div>
        </aside>

        <section className="flex-1">{children}</section>
      </div>
    </main>
  );
}