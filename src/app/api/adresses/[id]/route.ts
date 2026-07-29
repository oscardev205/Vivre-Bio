// src/app/api/adresses/[id]/route.ts
// PATCH : définit une adresse comme adresse par défaut. DELETE : supprime une adresse.
// Les deux vérifient que l'adresse appartient bien à l'utilisateur connecté.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const userId = (session.user as { id: string }).id;

  const adresse = await prisma.address.findUnique({ where: { id } });
  if (!adresse || adresse.userId !== userId) {
    return NextResponse.json({ erreur: "Adresse introuvable" }, { status: 404 });
  }

  // On retire le statut par défaut des autres adresses avant de le poser sur celle-ci
  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId }, data: { parDefaut: false } }),
    prisma.address.update({ where: { id }, data: { parDefaut: true } }),
  ]);

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const userId = (session.user as { id: string }).id;

  const adresse = await prisma.address.findUnique({ where: { id } });
  if (!adresse || adresse.userId !== userId) {
    return NextResponse.json({ erreur: "Adresse introuvable" }, { status: 404 });
  }

  await prisma.address.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}