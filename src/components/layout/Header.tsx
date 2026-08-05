// src/components/layout/Header.tsx
// Fichier complet : utilise désormais HeaderNavPrincipale et HeaderCategories
// pour mettre en évidence l'onglet/catégorie actif.

import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { User, ShieldCheck, Truck } from "lucide-react";
import { getCategories } from "@/lib/produits";
import { authOptions } from "@/lib/auth";
import { CartIcon } from "@/components/layout/CartIcon";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { HeaderNavPrincipale, HeaderCategories } from "@/components/layout/HeaderNav";

export async function Header() {
  const [categories, session] = await Promise.all([
    getCategories(),
    getServerSession(authOptions),
  ]);

  const role = (session?.user as { role?: string })?.role;

  return (
    <header className="sticky top-0 z-20 border-b border-sable bg-papier/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <MobileMenu categories={categories} />
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="Vivre Bio" width={160} height={50} className="h-10 w-auto sm:h-11" priority />
          </Link>
        </div>

        <HeaderNavPrincipale />

        <div className="flex items-center gap-4 text-encre sm:gap-5">
          {role === "ADMIN" && (
            <Link href="/admin" aria-label="Back-office admin" className="hidden items-center gap-1.5 rounded-full bg-vivrebio-rouge px-3 py-1 text-xs font-medium text-white sm:flex">
              <ShieldCheck size={13} /> Admin
            </Link>
          )}
          {role === "LIVREUR" && (
            <Link href="/livreur" aria-label="Espace livreur" className="hidden items-center gap-1.5 rounded-full bg-vivrebio-vert px-3 py-1 text-xs font-medium text-white sm:flex">
              <Truck size={13} /> Mes livraisons
            </Link>
          )}
          <ThemeToggle />
          <HeaderSearch />
          <Link href="/compte" aria-label="Mon compte"><User size={19} /></Link>
          <CartIcon />
        </div>
      </div>

      <HeaderCategories categories={categories} />
    </header>
  );
}