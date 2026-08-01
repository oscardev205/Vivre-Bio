// src/lib/livraison.ts
// Ajout de zoneTrouvee (pour savoir si la ville est réellement couverte ou si
// c'est le tarif par défaut appliqué faute de mieux) et export du montant par
// défaut pour que le panier affiche la même valeur que le calcul serveur.

import { prisma } from "@/lib/prisma";

export const FRAIS_LIVRAISON_DEFAUT = 2000;

function normaliser(texte: string): string {
  return texte.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

export async function getFraisLivraison(ville: string): Promise<{
  frais: number;
  delaiEstime: string | null;
  zoneTrouvee: boolean;
}> {
  const zones = await prisma.deliveryZone.findMany({ where: { actif: true } });
  const zone = zones.find((z) => normaliser(z.ville) === normaliser(ville));

  if (zone) return { frais: zone.frais, delaiEstime: zone.delaiEstime, zoneTrouvee: true };
  return { frais: FRAIS_LIVRAISON_DEFAUT, delaiEstime: null, zoneTrouvee: false };
}