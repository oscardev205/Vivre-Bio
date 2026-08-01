// src/app/api/adresses/[id]/route.ts
// DELETE : supprime réellement si l'adresse n'est liée à aucune commande,
// sinon l'archive (masquée de la liste, mais les commandes passées restent intactes).

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });

  const adresse = await prisma.address.findUnique({ where: { id } });
  if (!adresse || adresse.userId !== userId) {
    return NextResponse.json({ erreur: "Adresse introuvable" }, { status: 404 });
  }

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
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });

  const adresse = await prisma.address.findUnique({ where: { id } });
  if (!adresse || adresse.userId !== userId) {
    return NextResponse.json({ erreur: "Adresse introuvable" }, { status: 404 });
  }

  const nombreCommandes = await prisma.order.count({ where: { addressId: id } });

  if (nombreCommandes > 0) {
    // Liée à une commande : on archive plutôt que supprimer, pour préserver l'historique
    await prisma.address.update({ where: { id }, data: { archivee: true, parDefaut: false } });
    return NextResponse.json({ ok: true, archivee: true });
  }

  await prisma.address.delete({ where: { id } });
  return NextResponse.json({ ok: true, archivee: false });
}