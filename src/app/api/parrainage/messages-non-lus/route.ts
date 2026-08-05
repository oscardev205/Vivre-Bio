// src/app/api/parrainage/messages-non-lus/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });

  const nombre = await prisma.messageParrainage.count({
    where: { auteurId: { not: userId }, lu: false, OR: [{ parrainId: userId }, { filleulId: userId }] },
  });

  return NextResponse.json({ nombre });
}