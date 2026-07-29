// src/app/compte/page.tsx
// Tableau de bord : message de bienvenue + résumé de la dernière commande.

import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrix } from "@/lib/format";

export default async function TableauDeBordPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id: string }).id;

  const derniereCommande = await prisma.order.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const nombreCommandes = await prisma.order.count({ where: { userId } });

  return (
    <div>
      <p className="mb-6 text-sm text-gray-600">
        Bonjour <strong>{session?.user?.name || session?.user?.email}</strong>, ravi de vous revoir.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400">Total des commandes</p>
          <p className="mt-1 text-2xl font-semibold text-vivrebio-vert">{nombreCommandes}</p>
        </div>

        <div className="rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400">Dernière commande</p>
          {derniereCommande ? (
            <>
              <p className="mt-1 text-sm font-medium">{derniereCommande.numero}</p>
              <p className="text-xs text-gray-500">
                {formatPrix(derniereCommande.total)} · {derniereCommande.statut}
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-gray-400">Aucune commande pour l&apos;instant</p>
          )}
        </div>
      </div>

      <Link href="/boutique" className="mt-6 inline-block text-sm text-vivrebio-vert hover:underline">
        Continuer mes achats →
      </Link>
    </div>
  );
}