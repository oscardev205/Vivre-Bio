// src/app/livreur/layout.tsx
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { DeconnexionButton } from "@/components/compte/DeconnexionButton";

export default function LivreurLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/livreur" className="flex items-center gap-2 text-lg font-semibold text-vivrebio-vert">
          <LayoutDashboard size={18} /> Mes livraisons
        </Link>
        <DeconnexionButton />
      </div>
      {children}
    </main>
  );
}