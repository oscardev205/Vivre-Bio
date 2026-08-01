// src/lib/admin.ts
// Vérifie côté serveur qu'on a bien affaire à un admin — utilisé dans les routes API,
// en plus du middleware (jamais confiance uniquement au filtrage de page).

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  return role === "ADMIN" ? session : null;
}