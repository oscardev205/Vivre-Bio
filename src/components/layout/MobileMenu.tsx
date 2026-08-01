// src/components/layout/MobileMenu.tsx
// Fichier complet : le fond du panneau (auparavant figé en #faf8f2) réagit
// désormais au thème actif via useTheme(), au lieu d'une couleur codée en dur.
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

type Categorie = { id: string; nom: string; slug: string };

export function MobileMenu({ categories }: { categories: Categorie[] }) {
  const [ouvert, setOuvert] = useState(false);
  const [monte, setMonte] = useState(false);
  const { sombre } = useTheme();

  useEffect(() => setMonte(true), []);

  useEffect(() => {
    document.body.style.overflow = ouvert ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [ouvert]);

  const fondPanneau = sombre ? "#14201a" : "#faf8f2";

  const panneau = (
    <div
      className="fixed inset-0 z-[9999] flex flex-col overflow-y-auto"
      style={{ backgroundColor: fondPanneau }}
    >
      <div className="flex items-center justify-between border-b border-sable px-4 py-4">
        <span className="text-lg font-bold">
          <span className="text-vivrebio-rouge">V</span>
          <span className="text-encre">ivre Bio</span>
        </span>
        <button onClick={() => setOuvert(false)} aria-label="Fermer le menu">
          <X size={22} className="text-encre" />
        </button>
      </div>

      <nav className="flex flex-col gap-1 p-4 text-base font-medium text-encre">
        <Link href="/" onClick={() => setOuvert(false)} className="rounded-lg px-3 py-2.5 hover:bg-vert-pale">
          Accueil
        </Link>
        <Link href="/boutique" onClick={() => setOuvert(false)} className="rounded-lg px-3 py-2.5 hover:bg-vert-pale">
          Boutique
        </Link>
        <Link href="/blog" onClick={() => setOuvert(false)} className="rounded-lg px-3 py-2.5 hover:bg-vert-pale">
          Blog
        </Link>
        <Link href="/a-propos" onClick={() => setOuvert(false)} className="rounded-lg px-3 py-2.5 hover:bg-vert-pale">
          À propos
        </Link>
        <Link href="/contact" onClick={() => setOuvert(false)} className="rounded-lg px-3 py-2.5 hover:bg-vert-pale">
          Contact
        </Link>
      </nav>

      <div className="border-t border-sable p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-encre/40">Catégories</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/boutique?categorie=${cat.slug}`}
              onClick={() => setOuvert(false)}
              className="rounded-full border border-sable px-3.5 py-1.5 text-xs font-medium text-encre/70"
            >
              {cat.nom}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="md:hidden">
      <button onClick={() => setOuvert(true)} aria-label="Ouvrir le menu">
        <Menu size={22} className="text-encre" />
      </button>

      {ouvert && monte && createPortal(panneau, document.body)}
    </div>
  );
}