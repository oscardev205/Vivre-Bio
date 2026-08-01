// src/lib/seo.ts
// Petit utilitaire pour construire les URLs absolues de façon cohérente partout.

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function urlAbsolue(chemin: string): string {
  return `${SITE_URL}${chemin.startsWith("/") ? chemin : `/${chemin}`}`;
}