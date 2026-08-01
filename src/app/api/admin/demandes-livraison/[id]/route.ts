// src/app/api/admin/demandes-livraison/[id]/route.ts
// PATCH : approuve (crée la zone avec le tarif choisi + notifie le client) ou refuse.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { envoyerZoneApprouvee } from "@/lib/email";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const { id } = await params;
  const { action, frais, delaiEstime } = await request.json();

  const demande = await prisma.deliveryRequest.findUnique({ where: { id } });
  if (!demande) return NextResponse.json({ erreur: "Demande introuvable" }, { status: 404 });

  if (action === "approuver") {
    if (!frais) return NextResponse.json({ erreur: "Frais requis pour approuver" }, { status: 400 });

    await prisma.deliveryZone.upsert({
      where: { ville: demande.ville },
      create: { ville: demande.ville, frais: Number(frais), delaiEstime: delaiEstime || null },
      update: { frais: Number(frais), delaiEstime: delaiEstime || null, actif: true },
    });

    await prisma.deliveryRequest.update({ where: { id }, data: { statut: "APPROUVEE" } });

    if (demande.email) {
      await envoyerZoneApprouvee({ destinataire: demande.email, ville: demande.ville, frais: Number(frais) });
    }
  } else {
    await prisma.deliveryRequest.update({ where: { id }, data: { statut: "REFUSEE" } });
  }

  return NextResponse.json({ ok: true });
}