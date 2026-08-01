// src/app/api/commandes/route.ts
// Fichier complet : ajoute la vérification de l'interrupteur admin (fidélité
// active/inactive), stocke la réduction points séparément (reductionPoints)
// pour un affichage clair partout, et corrige la validation.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { genererNumeroCommande } from "@/lib/order";
import { getFraisLivraison } from "@/lib/livraison";
import { estFideliteActive } from "@/lib/parametres";
import { VALEUR_POINT_EN_FCFA } from "@/lib/fidelite";

type PanierEntree = { productId: string; quantite: number };

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const body = await request.json();

  const {
    items,
    adresse,
    addressId,
    invite,
    modePaiement,
    codePromo,
    modeLivraison = "LIVRAISON",
    contactNom,
    contactTelephone,
    pointsUtilises,
  } = body as {
    items: PanierEntree[];
    adresse?: {
      nomComplet: string;
      telephone: string;
      ville: string;
      quartier: string;
      adresseDetail: string;
      instructions?: string;
      latitude?: number;
      longitude?: number;
    };
    addressId?: string;
    invite?: { nom: string; email: string; telephone: string };
    modePaiement: string;
    codePromo?: string;
    modeLivraison?: "LIVRAISON" | "RETRAIT";
    contactNom?: string;
    contactTelephone?: string;
    pointsUtilises?: number;
  };

  if (!items || items.length === 0) {
    return NextResponse.json({ erreur: "Le panier est vide" }, { status: 400 });
  }

  const userId = session?.user ? (session.user as { id: string }).id : null;
  if (!userId && !invite) {
    return NextResponse.json({ erreur: "Informations invité manquantes" }, { status: 400 });
  }

  let adresseId: string | undefined;
  let fraisLivraison = 0;

  if (modeLivraison === "RETRAIT") {
    if (!contactNom || !contactTelephone) {
      return NextResponse.json({ erreur: "Nom et téléphone requis pour le retrait" }, { status: 400 });
    }
  } else {
    let villeLivraison: string;

    if (addressId) {
      if (!userId) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });
      const adresseExistante = await prisma.address.findUnique({ where: { id: addressId } });
      if (!adresseExistante || adresseExistante.userId !== userId) {
        return NextResponse.json({ erreur: "Adresse introuvable" }, { status: 404 });
      }
      adresseId = adresseExistante.id;
      villeLivraison = adresseExistante.ville;
    } else if (adresse) {
      const nouvelleAdresse = await prisma.address.create({
        data: { ...adresse, userId: userId ?? undefined },
      });
      adresseId = nouvelleAdresse.id;
      villeLivraison = adresse.ville;
    } else {
      return NextResponse.json({ erreur: "Adresse manquante" }, { status: 400 });
    }

    const resultatFrais = await getFraisLivraison(villeLivraison);
    if (!resultatFrais.zoneTrouvee) {
      return NextResponse.json(
        {
          erreur: `Nous ne livrons pas encore à ${villeLivraison}. Choisissez le retrait en boutique ou envoyez une demande de couverture.`,
        },
        { status: 400 }
      );
    }
    fraisLivraison = resultatFrais.frais;
  }

  const produitsIds = items.map((i) => i.productId);
  const produits = await prisma.product.findMany({ where: { id: { in: produitsIds } } });

  let sousTotal = 0;
  const lignesACreer: { productId: string; quantite: number; prixUnitaire: number }[] = [];

  for (const item of items) {
    const produit = produits.find((p) => p.id === item.productId);
    if (!produit || !produit.actif) {
      return NextResponse.json({ erreur: `Produit indisponible : ${item.productId}` }, { status: 400 });
    }
    if (produit.stock < item.quantite) {
      return NextResponse.json({ erreur: `Stock insuffisant pour ${produit.nom}` }, { status: 400 });
    }
    sousTotal += produit.prix * item.quantite;
    lignesACreer.push({ productId: produit.id, quantite: item.quantite, prixUnitaire: produit.prix });
  }

  let promoValide = null;
  let montantReduction = 0;
  if (codePromo) {
    const promo = await prisma.promoCode.findUnique({ where: { code: codePromo.toUpperCase().trim() } });
    const valide =
      promo &&
      promo.actif &&
      (!promo.dateExpiration || promo.dateExpiration >= new Date()) &&
      (promo.utilisationMax === null || promo.nombreUtilisations < promo.utilisationMax) &&
      (!promo.montantMinimum || sousTotal >= promo.montantMinimum);

    if (valide && promo) {
      promoValide = promo;
      montantReduction =
        promo.type === "POURCENTAGE" ? Math.round((sousTotal * promo.valeur) / 100) : Math.min(promo.valeur, sousTotal);
    }
  }

  // Points de fidélité : ignorés entièrement si le programme est désactivé,
  // même si le client en avait sélectionné avant la désactivation.
  let pointsReellementUtilises = 0;
  let reductionPoints = 0;
  const fideliteActive = await estFideliteActive();
  if (fideliteActive && pointsUtilises && pointsUtilises > 0 && userId) {
    const utilisateur = await prisma.user.findUnique({ where: { id: userId } });
    const soldeReel = utilisateur?.pointsFidelite ?? 0;
    pointsReellementUtilises = Math.min(pointsUtilises, soldeReel);
    reductionPoints = pointsReellementUtilises * VALEUR_POINT_EN_FCFA;
  }

  const total = Math.max(0, sousTotal - montantReduction - reductionPoints) + fraisLivraison;

  const commande = await prisma.$transaction(async (tx) => {
    const nouvelleCommande = await tx.order.create({
      data: {
        numero: genererNumeroCommande(),
        total,
        fraisLivraison,
        modeLivraison,
        modePaiement,
        userId: userId ?? undefined,
        nomInvite: invite?.nom,
        emailInvite: invite?.email,
        telephoneInvite: invite?.telephone,
        addressId,
        contactNom: modeLivraison === "RETRAIT" ? contactNom : undefined,
        contactTelephone: modeLivraison === "RETRAIT" ? contactTelephone : undefined,
        items: { create: lignesACreer },
        promoCodeId: promoValide?.id,
        montantReduction,
        pointsUtilises: pointsReellementUtilises,
        reductionPoints,
      },
    });

    for (const ligne of lignesACreer) {
      await tx.product.update({
        where: { id: ligne.productId },
        data: { stock: { decrement: ligne.quantite } },
      });
    }

    if (promoValide) {
      await tx.promoCode.update({ where: { id: promoValide.id }, data: { nombreUtilisations: { increment: 1 } } });
    }

    if (pointsReellementUtilises > 0 && userId) {
      await tx.user.update({
        where: { id: userId },
        data: { pointsFidelite: { decrement: pointsReellementUtilises } },
      });
      await tx.pointsTransaction.create({
        data: {
          userId,
          montant: -pointsReellementUtilises,
          motif: `Utilisés sur commande ${nouvelleCommande.numero}`,
        },
      });
    }

    return nouvelleCommande;
  });

  for (const ligne of lignesACreer) {
    const produit = await prisma.product.findUnique({ where: { id: ligne.productId } });
    if (
      produit?.seuilAlerte !== null &&
      produit &&
      produit.stock <= produit.seuilAlerte! &&
      produit.stock + ligne.quantite > produit.seuilAlerte!
    ) {
      const { envoyerAlerteStockBas } = await import("@/lib/email");
      await envoyerAlerteStockBas({ nomProduit: produit.nom, stockActuel: produit.stock, seuil: produit.seuilAlerte! });
    }
  }

  return NextResponse.json({ id: commande.id, numero: commande.numero, total: commande.total });
}