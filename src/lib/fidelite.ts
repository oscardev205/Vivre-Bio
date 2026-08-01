// src/lib/fidelite.ts
// Fichier complet : VALEUR_POINT_EN_FCFA est maintenant exportée pour être
// réutilisée dans /api/commandes, sans dupliquer la valeur à deux endroits.

export const POINTS_PAR_100_FCFA = 1;
export const VALEUR_POINT_EN_FCFA = 5;
export const POINTS_MINIMUM_UTILISATION = 20;

export function calculerPointsGagnes(montant: number): number {
  return Math.floor(montant / 100) * POINTS_PAR_100_FCFA;
}

export function calculerReductionPoints(points: number): number {
  return points * VALEUR_POINT_EN_FCFA;
}