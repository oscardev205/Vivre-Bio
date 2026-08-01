// src/app/api/admin/zones-livraison/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });
  const zones = await prisma.deliveryZone.findMany({ orderBy: { ville: "asc" } });
  return NextResponse.json(zones);
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const { ville, frais, delaiEstime } = await request.json();
  if (!ville || !frais) {
    return NextResponse.json({ erreur: "Ville et frais requis" }, { status: 400 });
  }

  const zone = await prisma.deliveryZone.create({
    data: { ville: ville.trim(), frais: Number(frais), delaiEstime: delaiEstime || null },
  });
  return NextResponse.json(zone);
}