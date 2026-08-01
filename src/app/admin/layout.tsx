// src/app/admin/layout.tsx
// Fichier complet : nav en défilement horizontal sur mobile, min-w-0 sur la
// section principale pour empêcher les tableaux larges de forcer la page
// entière à déborder horizontalement.

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Package, ClipboardList, Tag, MapPinned, MapPinPlus,
  Mail, Newspaper, CircleHelp, Gift,
} from "lucide-react";
import { authOptions } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;

  if (!session) redirect("/connexion");
  if (role !== "ADMIN") redirect("/");

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="mb-4 flex items-center gap-2 sm:mb-6">
        <span className="rounded-full bg-vivrebio-rouge px-2.5 py-0.5 text-xs font-medium text-white">
          Admin
        </span>
        <h1 className="text-lg font-semibold text-encre sm:text-xl">Back-office Vivre Bio</h1>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <aside className="w-full shrink-0 md:w-48">
          <nav className="flex gap-2 overflow-x-auto pb-2 text-sm md:flex-col md:gap-1 md:overflow-visible md:pb-0">
            <Link href="/admin" className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-sable px-3 py-2 hover:bg-vert-pale md:border-0 md:px-2 md:py-1.5">
              <LayoutDashboard size={16} /> Tableau de bord
            </Link>
            <Link href="/admin/produits" className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-sable px-3 py-2 hover:bg-vert-pale md:border-0 md:px-2 md:py-1.5">
              <Package size={16} /> Produits
            </Link>
            <Link href="/admin/commandes" className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-sable px-3 py-2 hover:bg-vert-pale md:border-0 md:px-2 md:py-1.5">
              <ClipboardList size={16} /> Commandes
            </Link>
            <Link href="/admin/promos" className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-sable px-3 py-2 hover:bg-vert-pale md:border-0 md:px-2 md:py-1.5">
              <Tag size={16} /> Codes promo
            </Link>
            <Link href="/admin/zones-livraison" className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-sable px-3 py-2 hover:bg-vert-pale md:border-0 md:px-2 md:py-1.5">
              <MapPinned size={16} /> Zones de livraison
            </Link>
            <Link href="/admin/demandes-livraison" className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-sable px-3 py-2 hover:bg-vert-pale md:border-0 md:px-2 md:py-1.5">
              <MapPinPlus size={16} /> Demandes de zones
            </Link>
            <Link href="/admin/fidelite" className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-sable px-3 py-2 hover:bg-vert-pale md:border-0 md:px-2 md:py-1.5">
              <Gift size={16} /> Fidélité
            </Link>
            <Link href="/admin/blog" className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-sable px-3 py-2 hover:bg-vert-pale md:border-0 md:px-2 md:py-1.5">
              <Newspaper size={16} /> Blog
            </Link>
            <Link href="/admin/faq" className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-sable px-3 py-2 hover:bg-vert-pale md:border-0 md:px-2 md:py-1.5">
              <CircleHelp size={16} /> FAQ
            </Link>
            <Link href="/admin/newsletter" className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-sable px-3 py-2 hover:bg-vert-pale md:border-0 md:px-2 md:py-1.5">
              <Mail size={16} /> Newsletter
            </Link>
          </nav>
        </aside>

        <section className="min-w-0 flex-1">{children}</section>
      </div>
    </main>
  );
}