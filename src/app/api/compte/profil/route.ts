// src/app/api/compte/profil/route.ts
// PATCH : met à jour nom et téléphone de l'utilisateur connecté.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });

  const { nom, telephone } = await request.json();

  if (!nom || !nom.trim()) {
    return NextResponse.json({ erreur: "Le nom ne peut pas être vide" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { nom: nom.trim(), telephone: telephone?.trim() || undefined },
  });

  return NextResponse.json({ ok: true });
}