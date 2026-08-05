// src/lib/fidelite.ts
// Fichier complet : VALEUR_POINT_EN_FCFA n'est plus une constante figée —
// getValeurPointFcfa() la lit désormais en base, modifiable par l'admin.

import { getParametre, setParametre } from "@/lib/parametres";

export const POINTS_PAR_100_FCFA = 1;
export const POINTS_MINIMUM_UTILISATION = 20;
const VALEUR_POINT_PAR_DEFAUT = "5";

export async function getValeurPointFcfa(): Promise<number> {
  const valeur = await getParametre("valeur_point_fcfa", VALEUR_POINT_PAR_DEFAUT);
  return Number(valeur);
}

export async function setValeurPointFcfa(valeur: number) {
  await setParametre("valeur_point_fcfa", String(valeur));
}

export function calculerPointsGagnes(montant: number): number {
  return Math.floor(montant / 100) * POINTS_PAR_100_FCFA;
}

export function calculerReductionPoints(points: number, valeurPointFcfa: number): number {
  return points * valeurPointFcfa;
}