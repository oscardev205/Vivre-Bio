// src/app/api/commandes/[numero]/confirmer-livraison/route.ts
// Ajout de logs pour comprendre où ça bloque exactement.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { envoyerNotificationLivraisonConfirmee } from "@/lib/email";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ numero: string }> }
) {
  const { numero } = await params;
  console.log("[confirmer-livraison] Requête reçue pour :", numero);

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  console.log("[confirmer-livraison] Session userId :", userId);

  const commande = await prisma.order.findUnique({ where: { numero } });
  if (!commande) {
    console.log("[confirmer-livraison] Commande introuvable");
    return NextResponse.json({ erreur: "Commande introuvable" }, { status: 404 });
  }
  console.log("[confirmer-livraison] Commande trouvée, userId commande :", commande.userId, "statut :", commande.statut);

  if (!userId || commande.userId !== userId) {
    console.log("[confirmer-livraison] Refusé : utilisateur non autorisé");
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });
  }
  if (commande.statut !== "EXPEDIEE") {
    console.log("[confirmer-livraison] Refusé : statut incorrect ->", commande.statut);
    return NextResponse.json({ erreur: "Cette commande n'est pas encore en cours de livraison" }, { status: 400 });
  }

  await prisma.order.update({
    where: { id: commande.id },
    data: { statut: "LIVREE", livraisonConfirmee: true, livraisonConfirmeeAt: new Date() },
  });
  console.log("[confirmer-livraison] Commande mise à jour en LIVREE");

  const nomClient = session?.user?.name ?? "Un client";
  await envoyerNotificationLivraisonConfirmee({ numero: commande.numero, clientNom: nomClient });

  return NextResponse.json({ ok: true });
}