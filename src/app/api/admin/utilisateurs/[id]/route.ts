// src/app/api/admin/utilisateurs/[id]/route.ts
// PATCH : change le rôle et/ou l'état actif/inactif — whitelist stricte,
// jamais data: body en direct (règle de sécurité déjà appliquée ailleurs).

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();

  const donnees: Record<string, unknown> = {};
  if (body.role === "CLIENT" || body.role === "ADMIN" || body.role === "LIVREUR") donnees.role = body.role;
  if (typeof body.actif === "boolean") donnees.actif = body.actif;

  const utilisateur = await prisma.user.update({ where: { id }, data: donnees });
  return NextResponse.json({ id: utilisateur.id, role: utilisateur.role, actif: utilisateur.actif });
}