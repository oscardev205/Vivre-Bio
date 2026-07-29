// src/components/layout/Header.tsx
// On remplace l'icône panier statique par le composant CartIcon dynamique.

import Link from "next/link";
import { Search, User } from "lucide-react";
import { getCategories } from "@/lib/produits";
import { CartIcon } from "@/components/layout/CartIcon";

export async function Header() {
  const categories = await getCategories();

  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold">
          <span className="text-vivrebio-rouge">V</span>
          <span className="text-vivrebio-vert">ivre Bio</span>
        </Link>

        <nav className="hidden gap-6 text-sm text-gray-700 md:flex">
          <Link href="/" className="hover:text-vivrebio-vert">Accueil</Link>
          <Link href="/boutique" className="hover:text-vivrebio-vert">Boutique</Link>
          <Link href="/a-propos" className="hover:text-vivrebio-vert">À propos</Link>
          <Link href="/contact" className="hover:text-vivrebio-vert">Contact</Link>
        </nav>

        <div className="flex items-center gap-4 text-vivrebio-vert">
          <Link href="/boutique"><Search size={20} /></Link>
          <Link href="/compte"><User size={20} /></Link>
          <CartIcon />
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl gap-4 overflow-x-auto px-4 pb-2 text-xs text-gray-500">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/boutique?categorie=${cat.slug}`}
            className="whitespace-nowrap hover:text-vivrebio-vert"
          >
            {cat.nom} ({cat._count.produits})
          </Link>
        ))}
      </div>
    </header>
  );
}