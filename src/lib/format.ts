// src/lib/format.ts
// Petites fonctions de formatage réutilisées partout dans l'interface.

// Affiche un prix en FCFA avec séparateur de milliers : 3500 -> "3 500 FCFA"
export function formatPrix(prix: number): string {
  return new Intl.NumberFormat("fr-FR").format(prix) + " FCFA";
}