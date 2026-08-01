// src/app/api/admin/produits/[id]/route.ts
// Ajout : déclenche les alertes "retour en stock" quand le stock passe de 0 à positif.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { envoyerAlerteRetourStock } from "@/lib/email";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();

  const avant = await prisma.product.findUnique({ where: { id } });
  const produit = await prisma.product.update({ where: { id }, data: body });

  // Le stock vient de repasser de 0 (ou moins) à un nombre positif : on notifie les inscrits
  if (avant && avant.stock <= 0 && produit.stock > 0) {
    const alertes = await prisma.stockAlert.findMany({ where: { productId: id, notifie: false } });
    for (const alerte of alertes) {
      await envoyerAlerteRetourStock({ destinataire: alerte.email, nomProduit: produit.nom, slug: produit.slug });
      await prisma.stockAlert.update({ where: { id: alerte.id }, data: { notifie: true } });
    }
  }

  return NextResponse.json(produit);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const { id } = await params;

  const nombreCommandes = await prisma.orderItem.count({ where: { productId: id } });
  if (nombreCommandes > 0) {
    return NextResponse.json(
      { erreur: "Ce produit apparaît dans des commandes existantes — désactive-le plutôt que de le supprimer." },
      { status: 409 }
    );
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}