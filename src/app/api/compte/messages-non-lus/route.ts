// src/app/api/compte/messages-non-lus/route.ts
// Équivalent client de /api/admin/messages-non-lus : compte les messages ADMIN
// non lus, uniquement sur les commandes du client connecté.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });

  const nombre = await prisma.message.count({
    where: { auteur: "ADMIN", lu: false, order: { userId } },
  });

  return NextResponse.json({ nombre });
}