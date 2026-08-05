// src/app/api/admin/produits/upload-image/route.ts
// Fichier complet : traite désormais l'image avec Sharp avant de l'envoyer
// à Vercel Blob — recadrage automatique des marges, centrage, format carré
// 800x800, compression optimisée.

import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import sharp from "sharp";
import { requireAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const formData = await request.formData();
  const fichier = formData.get("fichier") as File | null;

  if (!fichier) {
    return NextResponse.json({ erreur: "Aucun fichier reçu" }, { status: 400 });
  }
  if (!fichier.type.startsWith("image/")) {
    return NextResponse.json({ erreur: "Le fichier doit être une image" }, { status: 400 });
  }
  if (fichier.size > 10 * 1024 * 1024) {
    return NextResponse.json({ erreur: "L'image ne doit pas dépasser 10 Mo" }, { status: 400 });
  }

  try {
    const bufferOriginal = Buffer.from(await fichier.arrayBuffer());

    const bufferTraite = await sharp(bufferOriginal)
      .trim() // retire automatiquement les marges de couleur uniforme (fond blanc/vide)
      .resize(800, 800, {
        fit: "contain", // le produit entier tient dans le carré, jamais coupé
        background: { r: 255, g: 255, b: 255, alpha: 1 }, // complète en blanc si besoin
      })
      .webp({ quality: 82 }) // format moderne, léger, bonne qualité visuelle
      .toBuffer();

    const nomUnique = `${Date.now()}-${fichier.name.replace(/\.[^.]+$/, "")}.webp`;
    const blob = await put(nomUnique, bufferTraite, {
      access: "public",
      contentType: "image/webp",
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("[upload-image] Erreur de traitement :", error);
    return NextResponse.json({ erreur: "Impossible de traiter cette image, réessaie avec un autre fichier." }, { status: 500 });
  }
}