// src/components/layout/Header.tsx
// Fichier complet : ThemeToggle réintégré dans la zone d'icônes.

import Link from "next/link";
import { getServerSession } from "next-auth";
import { User, ShieldCheck } from "lucide-react";
import { getCategories } from "@/lib/produits";
import { authOptions } from "@/lib/auth";
import { CartIcon } from "@/components/layout/CartIcon";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export async function Header() {
  const [categories, session] = await Promise.all([
    getCategories(),
    getServerSession(authOptions),
  ]);

  const estAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-20 border-b border-sable bg-papier/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-3">
          <MobileMenu categories={categories} />
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-vivrebio-rouge">V</span>
            <span className="text-encre">ivre Bio</span>
          </Link>
        </div>

        <nav className="hidden gap-8 text-sm font-medium text-encre/70 md:flex">
          <Link href="/" className="transition hover:text-encre">Accueil</Link>
          <Link href="/boutique" className="transition hover:text-encre">Boutique</Link>
          <Link href="/blog" className="transition hover:text-encre">Blog</Link>
          <Link href="/a-propos" className="transition hover:text-encre">À propos</Link>
          <Link href="/contact" className="transition hover:text-encre">Contact</Link>
        </nav>

        <div className="flex items-center gap-4 text-encre sm:gap-5">
          {estAdmin && (
            <Link
              href="/admin"
              aria-label="Back-office admin"
              className="hidden items-center gap-1.5 rounded-full bg-vivrebio-rouge px-3 py-1 text-xs font-medium text-white sm:flex"
            >
              <ShieldCheck size={13} /> Admin
            </Link>
          )}
          <ThemeToggle />
          <HeaderSearch />
          <Link href="/compte" aria-label="Mon compte"><User size={19} /></Link>
          <CartIcon />
        </div>
      </div>

      <div className="mx-auto hidden max-w-6xl gap-2 overflow-x-auto px-4 pb-3 md:flex">
        <Link
          href="/boutique"
          className="whitespace-nowrap rounded-full border border-sable px-3.5 py-1.5 text-xs font-medium text-encre/70 transition hover:border-vivrebio-vert hover:text-vivrebio-vert"
        >
          Tout
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/boutique?categorie=${cat.slug}`}
            className="whitespace-nowrap rounded-full border border-sable px-3.5 py-1.5 text-xs font-medium text-encre/70 transition hover:border-vivrebio-vert hover:text-vivrebio-vert"
          >
            {cat.nom}
          </Link>
        ))}
      </div>
    </header>
  );
}