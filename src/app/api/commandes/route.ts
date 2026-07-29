// src/app/api/commandes/route.ts
// Crée une commande : recalcule les prix et le stock depuis la base (jamais depuis le client),
// gère à la fois les commandes invité et les commandes utilisateur connecté.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { genererNumeroCommande } from "@/lib/order";

const FRAIS_LIVRAISON = 1500; // valeur fixe pour l'instant, sera dynamique selon la ville plus tard

type PanierEntree = { productId: string; quantite: number };

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const body = await request.json();

  const { items, adresse, invite, modePaiement } = body as {
    items: PanierEntree[];
    adresse: {
      nomComplet: string;
      telephone: string;
      ville: string;
      quartier: string;
      adresseDetail: string;
      instructions?: string;
    };
    invite?: { nom: string; email: string; telephone: string };
    modePaiement: string;
  };

  if (!items || items.length === 0) {
    return NextResponse.json({ erreur: "Le panier est vide" }, { status: 400 });
  }

  // Un utilisateur invité doit fournir nom/email/téléphone ; un utilisateur connecté non
  const userId = session?.user ? (session.user as { id: string }).id : null;
  if (!userId && !invite) {
    return NextResponse.json({ erreur: "Informations invité manquantes" }, { status: 400 });
  }

  // Récupère les vrais produits en base pour recalculer le total en sécurité
  const produitsIds = items.map((i) => i.productId);
  const produits = await prisma.product.findMany({ where: { id: { in: produitsIds } } });

  let total = 0;
  const lignesACreer: { productId: string; quantite: number; prixUnitaire: number }[] = [];

  for (const item of items) {
    const produit = produits.find((p) => p.id === item.productId);
    if (!produit || !produit.actif) {
      return NextResponse.json({ erreur: `Produit indisponible : ${item.productId}` }, { status: 400 });
    }
    if (produit.stock < item.quantite) {
      return NextResponse.json({ erreur: `Stock insuffisant pour ${produit.nom}` }, { status: 400 });
    }
    total += produit.prix * item.quantite;
    lignesACreer.push({ productId: produit.id, quantite: item.quantite, prixUnitaire: produit.prix });
  }

  total += FRAIS_LIVRAISON;

  // Transaction : tout réussit ensemble, ou rien n'est enregistré
  const commande = await prisma.$transaction(async (tx) => {
    const nouvelleAdresse = await tx.address.create({
      data: { ...adresse, userId: userId ?? undefined },
    });

    const nouvelleCommande = await tx.order.create({
      data: {
        numero: genererNumeroCommande(),
        total,
        fraisLivraison: FRAIS_LIVRAISON,
        modePaiement,
        userId: userId ?? undefined,
        nomInvite: invite?.nom,
        emailInvite: invite?.email,
        telephoneInvite: invite?.telephone,
        addressId: nouvelleAdresse.id,
        items: { create: lignesACreer },
      },
    });

    // On décrémente le stock immédiatement à la création de la commande
    // (simplification : une gestion plus avancée réserverait le stock avec expiration)
    for (const ligne of lignesACreer) {
      await tx.product.update({
        where: { id: ligne.productId },
        data: { stock: { decrement: ligne.quantite } },
      });
    }

    return nouvelleCommande;
  });

  return NextResponse.json({ id: commande.id, numero: commande.numero, total: commande.total });
}