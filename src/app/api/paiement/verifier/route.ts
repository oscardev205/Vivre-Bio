// src/app/api/paiement/verifier/route.ts
// Fichier complet : points calculés sur (total - fraisLivraison) uniquement,
// et vérification de l'interrupteur admin avant toute attribution.

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
  const { transactionId, numero } = await request.json();

  const commande = await prisma.order.findUnique({
    where: { numero },
    include: {
      payment: true,
      user: true,
      address: true,
      items: { include: { product: true } },
    },
  });
  if (!commande) {
    return NextResponse.json({ erreur: "Commande introuvable" }, { status: 404 });
  }

  if (commande.statut === "PAYEE" || commande.payment) {
    return NextResponse.json({ ok: true, dejaTraitee: true });
  }

  try {
    const transaction = await k.verify(transactionId);

    if (transaction.status !== "SUCCESS") {
      return NextResponse.json({ erreur: "Transaction non réussie" }, { status: 400 });
    }

    const ecartAutorise = commande.total * 0.05;
    if (Math.abs(transaction.amount - commande.total) > ecartAutorise) {
      return NextResponse.json({ erreur: "Montant incohérent" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.order.update({ where: { id: commande.id }, data: { statut: "PAYEE" } }),
      prisma.payment.create({
        data: {
          orderId: commande.id,
          methode: commande.modePaiement,
          statut: "reussi",
          reference: transactionId,
        },
      }),
    ]);

    // Attribution des points — uniquement si le programme est actif, pour un
    // client connecté, et calculée sur le montant produits SEULEMENT
    // (total - frais de livraison), pas sur la livraison elle-même.
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

    const nomClient = commande.user?.nom ?? commande.nomInvite ?? commande.contactNom ?? "Client";
    const emailClient = commande.user?.email ?? commande.emailInvite;
    const telephoneClient =
      commande.user?.telephone ??
      commande.telephoneInvite ??
      commande.contactTelephone ??
      commande.address?.telephone;

    const lignesEmail = commande.items.map((l) => ({
      nom: l.product.nom,
      quantite: l.quantite,
      prixUnitaire: l.prixUnitaire,
    }));

    if (emailClient) {
      await envoyerEmailConfirmationCommande({
        destinataire: emailClient,
        numero: commande.numero,
        total: commande.total,
        lignes: lignesEmail,
      });
    }

    await envoyerEmailNotificationAdmin({
      numero: commande.numero,
      total: commande.total,
      lignes: lignesEmail,
      clientNom: nomClient,
      clientTelephone: telephoneClient ?? "Non renseigné",
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
    console.error("Erreur de vérification Kkiapay :", error);
    return NextResponse.json({ erreur: "Échec de la vérification" }, { status: 500 });
  }
}