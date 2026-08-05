// src/lib/livreur.ts
// Vérifie qu'une requête vient bien d'un livreur connecté — même principe que
// requireAdmin(), dédié au rôle LIVREUR.

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireLivreur() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "LIVREUR") return null;
  return session;
}