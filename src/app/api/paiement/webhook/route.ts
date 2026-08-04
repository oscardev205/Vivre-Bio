// src/app/api/paiement/webhook/route.ts
// Fichier complet, corrigé avec le vrai format Kkiapay (vérifié via leur doc
// officielle). Vérifie d'abord que l'appel vient bien de Kkiapay (en-tête
// x-kkiapay-secret), puis récupère les vrais détails de la transaction via
// k.verify() pour retrouver notre numéro de commande.

import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { kkiapay } from "@kkiapay-org/nodejs-sdk";
import { envoyerEmailConfirmationCommande, envoyerEmailNotificationAdmin } from "@/lib/email";
import { calculerPointsGagnes } from "@/lib/fidelite";
import { estFideliteActive } from "@/lib/parametres";

const k = kkiapay({
  privatekey: process.env.KKIAPAY_PRIVATE_KEY!,
  publickey: process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY!,
  secretkey: process.env.KKIAPAY_SECRET_KEY!,
  sandbox: process.env.NEXT_PUBLIC_KKIAPAY_SANDBOX !== "false",
});

export async function POST(request: Request) {
  // 1. Vérifie que l'appel vient bien de Kkiapay, pas de n'importe qui sur internet
  const secretRecu = request.headers.get("x-kkiapay-secret");
  if (!secretRecu || secretRecu !== process.env.KKIAPAY_WEBHOOK_SECRET) {
    return NextResponse.json({ erreur: "Signature invalide" }, { status: 401 });
  }

  const payload = await request.json();
  console.log("[webhook kkiapay] Événement reçu :", payload.event);

  // 2. On ne traite que les paiements réussis — un échec ne nécessite aucune action
  if (payload.event !== "transaction.success" || !payload.isPaymentSucces) {
    return NextResponse.json({ ok: true, ignore: true });
  }

  const transactionId = payload.transactionId;
  if (!transactionId) {
    return NextResponse.json({ erreur: "transactionId manquant" }, { status: 400 });
  }

  try {
    // 3. On revérifie la transaction nous-mêmes auprès de Kkiapay (jamais
    // confiance uniquement au contenu du webhook) — ça nous redonne aussi
    // le "data" qu'on avait mis (notre numéro de commande).
    const transaction = await k.verify(transactionId);
    const numero = (transaction as unknown as { data?: string }).data;

    if (!numero) {
      console.error("[webhook kkiapay] Impossible de retrouver le numéro de commande dans :", transaction);
      return NextResponse.json({ erreur: "Numéro de commande introuvable" }, { status: 400 });
    }

    const commande = await prisma.order.findUnique({
      where: { numero },
      include: { payment: true, user: true, address: true, items: { include: { product: true } } },
    });

    if (!commande) {
      return NextResponse.json({ erreur: "Commande introuvable" }, { status: 404 });
    }

    // Déjà traitée (par le navigateur du client, ou un appel webhook précédent)
    if (commande.statut === "PAYEE" || commande.payment) {
      return NextResponse.json({ ok: true, dejaTraitee: true });
    }

    const ecartAutorise = commande.total * 0.05;
    if (Math.abs(transaction.amount - commande.total) > ecartAutorise) {
      return NextResponse.json({ erreur: "Montant incohérent" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.order.update({ where: { id: commande.id }, data: { statut: "PAYEE" } }),
      prisma.payment.create({
        data: { orderId: commande.id, methode: commande.modePaiement, statut: "reussi", reference: transactionId },
      }),
    ]);

    if (commande.userId && (await estFideliteActive())) {
      const montantProduits = commande.total - commande.fraisLivraison;
      const points = calculerPointsGagnes(montantProduits);
      if (points > 0) {
        await prisma.$transaction([
          prisma.user.update({ where: { id: commande.userId }, data: { pointsFidelite: { increment: points } } }),
          prisma.pointsTransaction.create({
            data: { userId: commande.userId, montant: points, motif: `Commande ${commande.numero}` },
          }),
          prisma.order.update({ where: { id: commande.id }, data: { pointsGagnes: points } }),
        ]);
      }
    }

    const emailClient = commande.user?.email ?? commande.emailInvite;
    const lignesEmail = commande.items.map((l) => ({ nom: l.product.nom, quantite: l.quantite, prixUnitaire: l.prixUnitaire }));

    if (emailClient) {
      await envoyerEmailConfirmationCommande({ destinataire: emailClient, numero: commande.numero, total: commande.total, lignes: lignesEmail });
    }

    await envoyerEmailNotificationAdmin({
      numero: commande.numero,
      total: commande.total,
      lignes: lignesEmail,
      clientNom: commande.user?.nom ?? commande.nomInvite ?? commande.contactNom ?? "Client",
      clientTelephone: commande.user?.telephone ?? commande.telephoneInvite ?? commande.contactTelephone ?? "Non renseigné",
      clientEmail: emailClient ?? "Non renseigné",
      adresseLivraison:
        commande.modeLivraison === "RETRAIT"
          ? "Retrait en boutique"
          : commande.address
            ? `${commande.address.adresseDetail}, ${commande.address.quartier}, ${commande.address.ville}`
            : "Adresse non renseignée",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ ok: true, dejaTraitee: true });
    }
    console.error("[webhook kkiapay] Erreur :", error);
    return NextResponse.json({ erreur: "Échec du traitement" }, { status: 500 });
  }
}