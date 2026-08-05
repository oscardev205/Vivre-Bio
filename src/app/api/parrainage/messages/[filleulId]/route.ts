// src/app/api/parrainage/messages/[filleulId]/route.ts
// GET : fil de discussion entre le client connecté et un filleul/parrain précis.
// POST : envoie un message. Fonctionne dans les deux sens (le parrain peut
// écrire à son filleul, le filleul peut répondre à son parrain) — on vérifie
// juste que la relation parrain-filleul existe bien entre les deux comptes.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function verifierRelation(userId: string, autreId: string) {
  const relation = await prisma.user.findFirst({
    where: {
      OR: [
        { id: userId, parrainId: autreId },
        { id: autreId, parrainId: userId },
      ],
    },
  });
  return !!relation;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filleulId: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });

  const { filleulId } = await params;
  const relationValide = await verifierRelation(userId, filleulId);
  if (!relationValide) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const messages = await prisma.messageParrainage.findMany({
    where: {
      OR: [
        { parrainId: userId, filleulId },
        { parrainId: filleulId, filleulId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  // Marque comme lus les messages envoyés par l'autre personne
  await prisma.messageParrainage.updateMany({
    where: { auteurId: filleulId, lu: false, OR: [{ parrainId: userId }, { filleulId: userId }] },
    data: { lu: true },
  });

  return NextResponse.json(messages);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ filleulId: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });

  const { filleulId } = await params;
  const relationValide = await verifierRelation(userId, filleulId);
  if (!relationValide) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const { contenu } = await request.json();
  if (!contenu || !contenu.trim()) return NextResponse.json({ erreur: "Message vide" }, { status: 400 });

  // Détermine qui est le "parrain" et qui est le "filleul" dans cette relation
  const moi = await prisma.user.findUnique({ where: { id: userId } });
  const estFilleulDeLAutre = moi?.parrainId === filleulId;

  const message = await prisma.messageParrainage.create({
    data: {
      parrainId: estFilleulDeLAutre ? filleulId : userId,
      filleulId: estFilleulDeLAutre ? userId : filleulId,
      auteurId: userId,
      contenu: contenu.trim(),
    },
  });

  return NextResponse.json(message);
}