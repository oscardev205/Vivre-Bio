// src/app/api/admin/faq/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });
  const items = await prisma.faqItem.findMany({ orderBy: { ordre: "asc" } });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const { question, reponse } = await request.json();
  if (!question || !reponse) {
    return NextResponse.json({ erreur: "Champs manquants" }, { status: 400 });
  }

  const dernier = await prisma.faqItem.findFirst({ orderBy: { ordre: "desc" } });
  const item = await prisma.faqItem.create({
    data: { question, reponse, ordre: (dernier?.ordre ?? 0) + 1 },
  });
  return NextResponse.json(item);
}