// src/app/api/livreur/disponibilite/route.ts
// Fichier complet : ajout du GET pour récupérer l'état actuel au chargement
// de la page, en plus du PATCH déjà existant pour le modifier.

import { NextResponse } from "next/server";
import { requireLivreur } from "@/lib/livreur";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireLivreur();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const livreurId = (session.user as { id: string }).id;
  const utilisateur = await prisma.user.findUnique({
    where: { id: livreurId },
    select: { disponible: true },
  });

  return NextResponse.json({ disponible: utilisateur?.disponible ?? false });
}

export async function PATCH(request: Request) {
  const session = await requireLivreur();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const { disponible } = await request.json();
  const livreurId = (session.user as { id: string }).id;

  const utilisateur = await prisma.user.update({
    where: { id: livreurId },
    data: { disponible: !!disponible },
  });

  return NextResponse.json({ disponible: utilisateur.disponible });
}