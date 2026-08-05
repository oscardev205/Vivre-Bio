// src/components/layout/HeaderNav.tsx
// Extrait la nav principale + les pastilles catégories dans un composant
// client, pour marquer l'onglet/catégorie actif via usePathname/useSearchParams.
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type Categorie = { id: string; nom: string; slug: string };

export function HeaderNavPrincipale() {
  const pathname = usePathname();
  const liens = [
    { href: "/", label: "Accueil", exact: true },
    { href: "/boutique", label: "Boutique" },
    { href: "/blog", label: "Blog" },
    { href: "/a-propos", label: "À propos" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="hidden gap-8 text-sm font-medium md:flex">
      {liens.map(({ href, label, exact }) => {
        const actif = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={`transition ${actif ? "font-semibold text-vivrebio-vert" : "text-encre/70 hover:text-encre"}`}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function HeaderCategories({ categories }: { categories: Categorie[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categorieActive = pathname === "/boutique" ? searchParams.get("categorie") : null;

  return (
    <div className="mx-auto hidden max-w-6xl gap-2 overflow-x-auto px-4 pb-3 md:flex">
      <Link
        href="/boutique"
        className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
          pathname === "/boutique" && !categorieActive
            ? "border-vivrebio-vert bg-vivrebio-vert text-white"
            : "border-sable text-encre/70 hover:border-vivrebio-vert hover:text-vivrebio-vert"
        }`}
      >
        Tout
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/boutique?categorie=${cat.slug}`}
          className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
            categorieActive === cat.slug
              ? "border-vivrebio-vert bg-vivrebio-vert text-white"
              : "border-sable text-encre/70 hover:border-vivrebio-vert hover:text-vivrebio-vert"
          }`}
        >
          {cat.nom}
        </Link>
      ))}
    </div>
  );
}