// src/lib/parrainage.ts
// Fichier complet : calculerCommissionPoints reçoit désormais la valeur du
// point en paramètre, au lieu d'utiliser une constante figée.

import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getParametre, setParametre } from "@/lib/parametres";

const TAUX_PAR_DEFAUT = "5";

export async function estParrainageActif(): Promise<boolean> {
  const valeur = await getParametre("parrainage_actif", "true");
  return valeur === "true";
}

export async function getTauxCommission(): Promise<number> {
  const valeur = await getParametre("parrainage_taux", TAUX_PAR_DEFAUT);
  return Number(valeur);
}

export async function setTauxCommission(taux: number) {
  await setParametre("parrainage_taux", String(taux));
}

export function calculerCommissionPoints(sousTotalProduits: number, tauxPourcentage: number, valeurPointFcfa: number): number {
  const commissionFcfa = Math.round((sousTotalProduits * tauxPourcentage) / 100);
  return Math.floor(commissionFcfa / valeurPointFcfa);
}

export async function genererCodeParrainageUnique(): Promise<string> {
  for (let tentative = 0; tentative < 5; tentative++) {
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    const existant = await prisma.user.findUnique({ where: { codeParrainage: code } });
    if (!existant) return code;
  }
  throw new Error("Impossible de générer un code de parrainage unique");
}