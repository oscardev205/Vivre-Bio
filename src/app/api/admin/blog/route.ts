// src/app/api/admin/blog/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { genererSlug } from "@/lib/slug";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });
  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const { titre, extrait, contenu, publie } = await request.json();
  if (!titre || !extrait || !contenu) {
    return NextResponse.json({ erreur: "Champs manquants" }, { status: 400 });
  }

  const slug = genererSlug(titre);
  const post = await prisma.post.create({
    data: { titre, slug, extrait, contenu, publie: !!publie },
  });
  return NextResponse.json(post);
}