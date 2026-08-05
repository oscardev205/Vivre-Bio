// src/lib/parrainageCredit.ts
// Fichier complet : récupère désormais la valeur du point dynamiquement
// avant de calculer la commission.

import { prisma } from "@/lib/prisma";
import { estParrainageActif, getTauxCommission, calculerCommissionPoints } from "@/lib/parrainage";
import { getValeurPointFcfa } from "@/lib/fidelite";
import { envoyerNotificationGainParrainage } from "@/lib/email";

export async function crediterCommissionParrainage(commandeId: string) {
  if (!(await estParrainageActif())) return;

  const commande = await prisma.order.findUnique({
    where: { id: commandeId },
    include: { user: true, items: true, gainParrainage: true },
  });

  if (!commande || !commande.userId || !commande.user?.parrainId || commande.gainParrainage) return;

  const sousTotalProduits = commande.items.reduce((s, l) => s + l.prixUnitaire * l.quantite, 0);
  const [taux, valeurPoint] = await Promise.all([getTauxCommission(), getValeurPointFcfa()]);
  const points = calculerCommissionPoints(sousTotalProduits, taux, valeurPoint);

  if (points <= 0) return;

  await prisma.$transaction([
    prisma.gainParrainage.create({
      data: { parrainId: commande.user.parrainId, filleulId: commande.userId, orderId: commande.id, type: "COMMISSION", points },
    }),
    prisma.user.update({ where: { id: commande.user.parrainId }, data: { pointsFidelite: { increment: points } } }),
    prisma.pointsTransaction.create({
      data: { userId: commande.user.parrainId, montant: points, motif: `Commission de parrainage — commande ${commande.numero}` },
    }),
  ]);

  const parrain = await prisma.user.findUnique({ where: { id: commande.user.parrainId } });
  if (parrain?.email) {
    await envoyerNotificationGainParrainage({ destinataire: parrain.email, points, nomFilleul: commande.user.nom ?? "Votre filleul" });
  }
}