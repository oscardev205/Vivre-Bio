// src/components/layout/HeaderSearch.tsx
// Correction : largeur réduite sur très petit écran pour ne pas pousser
// les icônes (compte, panier) hors de l'écran visible.
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export function HeaderSearch() {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [valeur, setValeur] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ouvert) inputRef.current?.focus();
  }, [ouvert]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valeur.trim()) return;
    router.push(`/boutique?recherche=${encodeURIComponent(valeur.trim())}`);
    setOuvert(false);
    setValeur("");
  }

  if (ouvert) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
        <input
          ref={inputRef}
          value={valeur}
          onChange={(e) => setValeur(e.target.value)}
          onBlur={() => !valeur && setOuvert(false)}
          placeholder="Rechercher..."
          className="w-24 rounded-full border border-sable px-3 py-1.5 text-sm sm:w-40 md:w-48"
        />
        <button type="button" onClick={() => setOuvert(false)} aria-label="Fermer la recherche">
          <X size={18} className="text-encre/50" />
        </button>
      </form>
    );
  }

  return (
    <button onClick={() => setOuvert(true)} aria-label="Rechercher">
      <Search size={19} />
    </button>
  );
}