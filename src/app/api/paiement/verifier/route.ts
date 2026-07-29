// src/app/api/paiement/verifier/route.ts
// On envoie maintenant les DEUX e-mails après confirmation du paiement :
// un au client, un à l'admin Vivre Bio.

import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { kkiapay } from "@kkiapay-org/nodejs-sdk";
import { envoyerEmailConfirmationCommande, envoyerEmailNotificationAdmin } from "@/lib/email";

const k = kkiapay({
  privatekey: process.env.KKIAPAY_PRIVATE_KEY!,
  publickey: process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY!,
  secretkey: process.env.KKIAPAY_SECRET_KEY!,
  sandbox: true,
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

    const nomClient = commande.user?.nom ?? commande.nomInvite ?? "Client";
    const emailClient = commande.user?.email ?? commande.emailInvite;
    const telephoneClient = commande.user?.telephone ?? commande.telephoneInvite ?? commande.address.telephone;

    const lignesEmail = commande.items.map((l) => ({
      nom: l.product.nom,
      quantite: l.quantite,
      prixUnitaire: l.prixUnitaire,
    }));

    // E-mail au client (seulement si on a une adresse — toujours le cas normalement)
    if (emailClient) {
      await envoyerEmailConfirmationCommande({
        destinataire: emailClient,
        numero: commande.numero,
        total: commande.total,
        lignes: lignesEmail,
      });
    }

    // E-mail à l'admin, systématique
    await envoyerEmailNotificationAdmin({
      numero: commande.numero,
      total: commande.total,
      lignes: lignesEmail,
      clientNom: nomClient,
      clientTelephone: telephoneClient ?? "Non renseigné",
      clientEmail: emailClient ?? "Non renseigné",
      adresseLivraison: `${commande.address.adresseDetail}, ${commande.address.quartier}, ${commande.address.ville}`,
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