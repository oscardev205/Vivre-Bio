// src/lib/slug.ts
// Génère un slug propre à partir d'un nom de produit (utilisé à la création).

export function genererSlug(texte: string): string {
  return texte
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}