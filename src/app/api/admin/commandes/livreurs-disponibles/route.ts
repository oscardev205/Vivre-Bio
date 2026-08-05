// src/app/api/admin/commandes/livreurs-disponibles/route.ts
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const livreurs = await prisma.user.findMany({
    where: { role: "LIVREUR", actif: true, disponible: true },
    select: { id: true, nom: true, telephone: true },
  });

  return NextResponse.json(livreurs);
}