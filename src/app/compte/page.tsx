// src/app/compte/page.tsx
// Ajout : si l'utilisateur est admin, un raccourci vers le back-office apparaît
// en haut du tableau de bord client.

import { getServerSession } from "next-auth";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrix } from "@/lib/format";

export default async function TableauDeBordPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id: string }).id;
  const estAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  const derniereCommande = await prisma.order.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const nombreCommandes = await prisma.order.count({ where: { userId } });

  return (
    <div>
      {estAdmin && (
        <Link
          href="/admin"
          className="mb-4 flex items-center gap-2 rounded-lg bg-vivrebio-rouge/10 px-4 py-2.5 text-sm font-medium text-vivrebio-rouge"
        >
          <ShieldCheck size={16} /> Accéder au back-office admin →
        </Link>
      )}

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