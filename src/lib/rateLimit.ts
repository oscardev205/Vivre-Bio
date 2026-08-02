// src/lib/rateLimit.ts
// Limite de débit générique, basée sur PostgreSQL. Compte les tentatives récentes
// pour une "clé" donnée (ex: "login:email@x.com" ou "contact:1.2.3.4") sur une
// fenêtre de temps glissante, et refuse si le maximum est dépassé.

import { prisma } from "@/lib/prisma";

export async function verifierLimiteDebit(
  cle: string,
  maxTentatives: number,
  fenetreMinutes: number
): Promise<boolean> {
  const depuis = new Date(Date.now() - fenetreMinutes * 60_000);

  const nombre = await prisma.rateLimitAttempt.count({
    where: { cle, createdAt: { gte: depuis } },
  });

  if (nombre >= maxTentatives) {
    return false; // bloqué
  }

  await prisma.rateLimitAttempt.create({ data: { cle } });
  return true; // autorisé
}

// Récupère l'adresse IP du visiteur depuis les en-têtes transmis par Vercel.
export function getIpClient(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "inconnu";
}