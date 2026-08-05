// src/app/api/fidelite/route.ts
// Fichier complet : ajoute valeurPoint à la réponse, pour que le panier et
// la page fidélité l'utilisent au lieu d'une valeur figée.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { estFideliteActive } from "@/lib/parametres";
import { getValeurPointFcfa } from "@/lib/fidelite";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });

  const [user, transactions, fideliteActive, valeurPoint] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.pointsTransaction.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 }),
    estFideliteActive(),
    getValeurPointFcfa(),
  ]);

  return NextResponse.json({ points: user?.pointsFidelite ?? 0, transactions, fideliteActive, valeurPoint });
}