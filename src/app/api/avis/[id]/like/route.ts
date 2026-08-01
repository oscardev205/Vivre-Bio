// src/app/api/avis/[id]/like/route.ts
// POST : bascule le like d'un avis (ajoute si absent, retire si déjà présent).
// Connexion obligatoire.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;

  if (!userId) {
    return NextResponse.json({ erreur: "Connectez-vous pour aimer un avis" }, { status: 401 });
  }

  const likeExistant = await prisma.reviewLike.findUnique({
    where: { reviewId_userId: { reviewId: id, userId } },
  });

  if (likeExistant) {
    await prisma.reviewLike.delete({ where: { id: likeExistant.id } });
    const total = await prisma.reviewLike.count({ where: { reviewId: id } });
    return NextResponse.json({ liked: false, total });
  }

  await prisma.reviewLike.create({ data: { reviewId: id, userId } });
  const total = await prisma.reviewLike.count({ where: { reviewId: id } });
  return NextResponse.json({ liked: true, total });
}