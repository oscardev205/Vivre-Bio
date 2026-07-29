// src/lib/order.ts
// Génère un numéro de commande lisible et unique, ex: VB-2026-4F9K2C

import { randomBytes } from "crypto";

export function genererNumeroCommande(): string {
  const annee = new Date().getFullYear();
  const code = randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
  return `VB-${annee}-${code}`;
}