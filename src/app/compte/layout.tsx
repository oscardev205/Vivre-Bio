// src/app/compte/layout.tsx
// Fichier complet : utilise désormais <CompteNav /> pour la navigation,
// avec mise en évidence de l'onglet actif.

import { DeconnexionButton } from "@/components/compte/DeconnexionButton";
import { CompteNav } from "@/components/compte/CompteNav";

export default function CompteLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <h1 className="mb-4 text-lg font-semibold text-vivrebio-vert sm:mb-6 sm:text-xl">Mon espace client</h1>

      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <aside className="w-full shrink-0 md:w-48">
          <CompteNav />
          <div className="mt-4 border-t border-sable pt-4">
            <DeconnexionButton />
          </div>
        </aside>

        <section className="min-w-0 flex-1">{children}</section>
      </div>
    </main>
  );
}