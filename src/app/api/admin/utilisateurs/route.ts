// src/app/api/admin/utilisateurs/route.ts
// Fichier complet : vérifie désormais le doublon sur e-mail ET téléphone
// avant de créer le compte, avec un message d'erreur clair dans les deux cas
// — au lieu de laisser Prisma renvoyer une erreur 500 brute et confuse.

import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { envoyerLienReinitialisation } from "@/lib/email";
import { SITE_URL } from "@/lib/seo";

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const q = searchParams.get("q");

  const utilisateurs = await prisma.user.findMany({
    where: {
      ...(role ? { role: role as "CLIENT" | "ADMIN" | "LIVREUR" } : {}),
      ...(q
        ? {
            OR: [
              { nom: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true, nom: true, email: true, telephone: true, role: true,
      actif: true, disponible: true, createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(utilisateurs);
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  try {
    const { nom, email, telephone, role } = await request.json();
    console.log("[admin/utilisateurs] Création demandée :", { nom, email, telephone, role });

    if (!nom || !email || !role) {
      return NextResponse.json({ erreur: "Champs manquants" }, { status: 400 });
    }
    if (role !== "ADMIN" && role !== "LIVREUR") {
      return NextResponse.json({ erreur: "Rôle invalide" }, { status: 400 });
    }

    // Vérifie le doublon sur e-mail ET téléphone (les deux ont une contrainte
    // unique en base) — évite l'erreur Prisma brute, message clair à la place.
    const existant = await prisma.user.findFirst({
      where: {
        OR: [{ email }, ...(telephone ? [{ telephone }] : [])],
      },
    });
    if (existant) {
      const champEnConflit = existant.email === email ? "cet e-mail" : "ce numéro de téléphone";
      return NextResponse.json({ erreur: `Un compte existe déjà avec ${champEnConflit}.` }, { status: 409 });
    }

    const motDePasseTemporaire = crypto.randomBytes(24).toString("hex");
    const hash = await bcrypt.hash(motDePasseTemporaire, 10);

    const utilisateur = await prisma.user.create({
      data: { nom, email, telephone: telephone || undefined, password: hash, role },
    });
    console.log("[admin/utilisateurs] Compte créé :", utilisateur.id);

    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: { token, userId: utilisateur.id, expiresAt: new Date(Date.now() + 24 * 60 * 60_000) },
    });

    await envoyerLienReinitialisation({
      destinataire: email,
      lien: `${SITE_URL}/reinitialiser-mot-de-passe?token=${token}`,
    });

    return NextResponse.json({ id: utilisateur.id, nom: utilisateur.nom, email: utilisateur.email, role: utilisateur.role });
  } catch (error) {
    console.error("[admin/utilisateurs] Erreur lors de la création :", error);
    return NextResponse.json({ erreur: "Une erreur serveur est survenue lors de la création du compte." }, { status: 500 });
  }
}