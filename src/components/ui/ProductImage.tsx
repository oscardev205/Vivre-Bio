// src/components/ui/ProductImage.tsx
// Fichier complet : simplifié — les photos étant désormais toujours carrées
// et centrées grâce au traitement Sharp à l'upload, object-cover suffit
// largement, sans jamais risquer de couper le produit (déjà centré dans son
// cadre carré par le serveur).
"use client";

import { useState } from "react";
import Image from "next/image";

type Props = { slug: string; nom: string; imageUrl?: string | null; className?: string };

export function ProductImage({ nom, imageUrl, className }: Props) {
  const [erreur, setErreur] = useState(false);

  if (!imageUrl || erreur) {
    return (
      <div className={`flex h-full w-full items-center justify-center rounded-lg bg-vert-pale dark:bg-[#1e3324] ${className ?? ""}`}>
        <span className="text-3xl font-semibold text-encre/70">{nom.charAt(0).toUpperCase()}</span>
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={nom}
      fill
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      className={`object-cover ${className ?? ""}`}
      onError={() => setErreur(true)}
    />
  );
}