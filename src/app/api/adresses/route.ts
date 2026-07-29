// src/app/api/adresses/route.ts
// GET : liste les adresses de l'utilisateur connecté. POST : en crée une nouvelle.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const adresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { parDefaut: "desc" },
  });

  return NextResponse.json(adresses);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const body = await request.json();

  // Si c'est la première adresse de l'utilisateur, elle devient automatiquement celle par défaut
  const nombreExistant = await prisma.address.count({ where: { userId } });

  const adresse = await prisma.address.create({
    data: { ...body, userId, parDefaut: nombreExistant === 0 },
  });

  return NextResponse.json(adresse);
}