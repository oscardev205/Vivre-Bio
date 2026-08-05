// src/app/api/compte/parrainage/route.ts
// Fichier complet : renvoie désormais aussi "monParrain" (pour qu'un filleul
// puisse discuter avec la personne qui l'a parrainé), et pour chaque
// filleul/parrain, le dernier message échangé + le nombre de non lus.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { genererCodeParrainageUnique } from "@/lib/parrainage";
import { SITE_URL } from "@/lib/seo";

async function getInfosMessagerie(monId: string, autreId: string) {
  const dernier = await prisma.messageParrainage.findFirst({
    where: { OR: [{ parrainId: monId, filleulId: autreId }, { parrainId: autreId, filleulId: monId }] },
    orderBy: { createdAt: "desc" },
  });
  const nonLus = await prisma.messageParrainage.count({
    where: {
      auteurId: autreId,
      lu: false,
      OR: [{ parrainId: monId, filleulId: autreId }, { parrainId: autreId, filleulId: monId }],
    },
  });
  return {
    dernierMessage: dernier ? { contenu: dernier.contenu, deMoi: dernier.auteurId === monId, createdAt: dernier.createdAt } : null,
    nonLus,
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });

  let utilisateur = await prisma.user.findUnique({ where: { id: userId }, include: { parrain: { select: { id: true, nom: true } } } });
  if (!utilisateur?.codeParrainage) {
    const code = await genererCodeParrainageUnique();
    await prisma.user.update({ where: { id: userId }, data: { codeParrainage: code } });
    utilisateur = await prisma.user.findUnique({ where: { id: userId }, include: { parrain: { select: { id: true, nom: true } } } });
  }

  const filleulsBruts = await prisma.user.findMany({
    where: { parrainId: userId },
    select: {
      id: true, nom: true, email: true, createdAt: true,
      gainsGeneres: { where: { parrainId: userId }, select: { points: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const filleuls = await Promise.all(
    filleulsBruts.map(async (f) => ({
      id: f.id,
      nom: f.nom ?? "Sans nom",
      email: f.email,
      inscritLe: f.createdAt,
      totalPoints: f.gainsGeneres.reduce((s, g) => s + g.points, 0),
      nombreCommandes: f.gainsGeneres.length,
      ...(await getInfosMessagerie(userId, f.id)),
    }))
  );

  const monParrain = utilisateur?.parrain
    ? { id: utilisateur.parrain.id, nom: utilisateur.parrain.nom ?? "Votre parrain", ...(await getInfosMessagerie(userId, utilisateur.parrain.id)) }
    : null;

  const totalGagne = filleuls.reduce((s, f) => s + f.totalPoints, 0);

  return NextResponse.json({
    code: utilisateur?.codeParrainage,
    lien: `${SITE_URL}/inscription?parrain=${utilisateur?.codeParrainage}`,
    filleuls,
    monParrain,
    resume: { totalPointsGagnes: totalGagne, nombreFilleuls: filleuls.length },
  });
}