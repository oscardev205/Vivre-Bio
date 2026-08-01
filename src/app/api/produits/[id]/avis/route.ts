// src/app/api/produits/[id]/avis/route.ts
// GET : liste les avis d'un produit, avec le nombre de likes et si l'utilisateur
// connecté a déjà liké chaque avis. POST : ajoute un avis (connexion obligatoire —
// on veut savoir qui parle, pas d'avis anonymes).

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;

  const avis = await prisma.review.findMany({
    where: { productId: id },
    include: {
      user: { select: { nom: true } },
      _count: { select: { likes: true } },
      likes: userId ? { where: { userId }, select: { id: true } } : false,
    },
    orderBy: { createdAt: "desc" },
  });

  const formatte = avis.map((a) => ({
    id: a.id,
    note: a.note,
    commentaire: a.commentaire,
    createdAt: a.createdAt,
    auteur: a.user.nom ?? "Client Vivre Bio",
    nombreLikes: a._count.likes,
    likeParUtilisateur: userId ? a.likes.length > 0 : false,
  }));

  return NextResponse.json(formatte);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;

  if (!userId) {
    return NextResponse.json({ erreur: "Connectez-vous pour laisser un avis" }, { status: 401 });
  }

  const { note, commentaire } = await request.json();

  if (!note || note < 1 || note > 5) {
    return NextResponse.json({ erreur: "Note invalide (1 à 5)" }, { status: 400 });
  }
  if (!commentaire || !commentaire.trim()) {
    return NextResponse.json({ erreur: "Le commentaire ne peut pas être vide" }, { status: 400 });
  }

  const avis = await prisma.review.create({
    data: { productId: id, userId, note, commentaire: commentaire.trim() },
    include: { user: { select: { nom: true } } },
  });

  return NextResponse.json({
    id: avis.id,
    note: avis.note,
    commentaire: avis.commentaire,
    createdAt: avis.createdAt,
    auteur: avis.user.nom ?? "Client Vivre Bio",
    nombreLikes: 0,
    likeParUtilisateur: false,
  });
}