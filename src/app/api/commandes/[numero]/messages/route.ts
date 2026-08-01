// src/app/api/commandes/[numero]/messages/route.ts
// GET : liste les messages d'une commande (accessible au client propriétaire OU à l'admin).
// POST : ajoute un message (auteur déduit de la session : ADMIN si role admin, sinon CLIENT).
// Marque automatiquement comme "lu" les messages du camp adverse à la consultation.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { envoyerNotificationNouveauMessage } from "@/lib/email";

async function verifierAcces(numero: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  const role = (session?.user as { role?: string })?.role;

  const commande = await prisma.order.findUnique({ where: { numero } });
  if (!commande) return { autorise: false as const };

  const estAdmin = role === "ADMIN";
  const estProprietaire = !!userId && commande.userId === userId;

  if (!estAdmin && !estProprietaire) return { autorise: false as const };

  return { autorise: true as const, commande, estAdmin, session };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ numero: string }> }
) {
  const { numero } = await params;
  const acces = await verifierAcces(numero);
  if (!acces.autorise) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const messages = await prisma.message.findMany({
    where: { orderId: acces.commande.id },
    orderBy: { createdAt: "asc" },
  });

  // Marque comme lus les messages envoyés par "l'autre camp"
  const auteurAdverse = acces.estAdmin ? "CLIENT" : "ADMIN";
  await prisma.message.updateMany({
    where: { orderId: acces.commande.id, auteur: auteurAdverse, lu: false },
    data: { lu: true },
  });

  return NextResponse.json(messages);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ numero: string }> }
) {
  const { numero } = await params;
  const acces = await verifierAcces(numero);
  if (!acces.autorise) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const { contenu } = await request.json();
  if (!contenu || !contenu.trim()) {
    return NextResponse.json({ erreur: "Message vide" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      orderId: acces.commande.id,
      auteur: acces.estAdmin ? "ADMIN" : "CLIENT",
      contenu: contenu.trim(),
    },
  });

  // Notifie l'autre camp par e-mail
  if (acces.estAdmin) {
    const client = await prisma.order.findUnique({
      where: { id: acces.commande.id },
      include: { user: true },
    });
    const emailClient = client?.user?.email ?? client?.emailInvite;
    if (emailClient) {
      await envoyerNotificationNouveauMessage({
        destinataire: emailClient,
        numero,
        expediteur: "Vivre Bio",
        apercu: contenu.trim(),
      });
    }
  } else {
    if (process.env.ADMIN_EMAIL) {
      await envoyerNotificationNouveauMessage({
        destinataire: process.env.ADMIN_EMAIL,
        numero,
        expediteur: acces.session?.user?.name ?? "Un client",
        apercu: contenu.trim(),
      });
    }
  }

  return NextResponse.json(message);
}