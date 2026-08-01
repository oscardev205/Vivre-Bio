// src/app/api/commandes/[numero]/facture/route.ts
// Génère et renvoie la facture PDF d'une commande — accessible au client
// propriétaire de la commande OU à un admin. Uniquement pour les commandes
// réellement payées (pas de facture pour une commande en attente).

import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FactureDocument } from "@/lib/pdf/FactureDocument";

const STATUTS_PAYES = ["PAYEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE"];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ numero: string }> }
) {
  const { numero } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  const role = (session?.user as { role?: string })?.role;

  const commande = await prisma.order.findUnique({
    where: { numero },
    include: { items: { include: { product: true } }, address: true, user: true },
  });

  if (!commande) {
    return NextResponse.json({ erreur: "Commande introuvable" }, { status: 404 });
  }

  const estProprietaire = !!userId && commande.userId === userId;
  const estAdmin = role === "ADMIN";
  if (!estProprietaire && !estAdmin) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });
  }

  if (!STATUTS_PAYES.includes(commande.statut)) {
    return NextResponse.json({ erreur: "Facture disponible uniquement pour les commandes payées" }, { status: 400 });
  }

  const sousTotal = commande.items.reduce((s, l) => s + l.prixUnitaire * l.quantite, 0);
  const nomClient = commande.user?.nom ?? commande.nomInvite ?? commande.contactNom ?? "Client";
  const telephone = commande.user?.telephone ?? commande.telephoneInvite ?? commande.contactTelephone ?? "—";

  const buffer = await renderToBuffer(
    FactureDocument({
      numero: commande.numero,
      date: new Date(commande.createdAt).toLocaleDateString("fr-FR"),
      nomClient,
      contactTelephone: telephone,
      adresseLigne1: commande.address ? `${commande.address.adresseDetail}, ${commande.address.quartier}` : undefined,
      adresseLigne2: commande.address ? commande.address.ville : undefined,
      lignes: commande.items.map((l) => ({ nom: l.product.nom, quantite: l.quantite, prixUnitaire: l.prixUnitaire })),
      sousTotal,
      montantReduction: commande.montantReduction,
      fraisLivraison: commande.fraisLivraison,
      total: commande.total,
      modePaiement: commande.modePaiement,
      modeLivraison: commande.modeLivraison,
    })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="facture-${commande.numero}.pdf"`,
    },
  });
}