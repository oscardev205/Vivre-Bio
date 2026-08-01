// src/app/api/admin/messages-non-lus/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const nombre = await prisma.message.count({ where: { auteur: "CLIENT", lu: false } });
  return NextResponse.json({ nombre });
}