// src/lib/prisma.ts
// Instance unique du client Prisma, réutilisée partout dans l'app.
// Évite de créer une nouvelle connexion à chaque appel (important en dev avec le hot-reload).

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;