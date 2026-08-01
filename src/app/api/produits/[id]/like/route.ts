// src/app/api/produits/[id]/like/route.ts
// POST : bascule le like d'un produit (le coeur sur la fiche produit).

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
    return NextResponse.json({ erreur: "Connectez-vous pour aimer ce produit" }, { status: 401 });
  }

  const likeExistant = await prisma.productLike.findUnique({
    where: { productId_userId: { productId: id, userId } },
  });

  if (likeExistant) {
    await prisma.productLike.delete({ where: { id: likeExistant.id } });
    const total = await prisma.productLike.count({ where: { productId: id } });
    return NextResponse.json({ liked: false, total });
  }

  await prisma.productLike.create({ data: { productId: id, userId } });
  const total = await prisma.productLike.count({ where: { productId: id } });
  return NextResponse.json({ liked: true, total });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;

  const total = await prisma.productLike.count({ where: { productId: id } });
  const likeParUtilisateur = userId
    ? !!(await prisma.productLike.findUnique({ where: { productId_userId: { productId: id, userId } } }))
    : false;

  return NextResponse.json({ total, likeParUtilisateur });
}