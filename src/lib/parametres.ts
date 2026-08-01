// src/lib/parametres.ts
// Réglages généraux du site, stockés en base sous forme clé/valeur — réutilisable
// pour d'autres options futures, pas seulement la fidélité.

import { prisma } from "@/lib/prisma";

export async function getParametre(cle: string, valeurParDefaut: string): Promise<string> {
  const param = await prisma.parametre.findUnique({ where: { cle } });
  return param?.valeur ?? valeurParDefaut;
}

export async function setParametre(cle: string, valeur: string) {
  await prisma.parametre.upsert({
    where: { cle },
    create: { cle, valeur },
    update: { valeur },
  });
}

export async function estFideliteActive(): Promise<boolean> {
  const valeur = await getParametre("fidelite_active", "true");
  return valeur === "true";
}