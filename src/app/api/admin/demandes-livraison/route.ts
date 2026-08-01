// src/app/api/admin/demandes-livraison/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });
  const demandes = await prisma.deliveryRequest.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(demandes);
}