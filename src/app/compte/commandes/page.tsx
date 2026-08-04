// src/app/compte/commandes/page.tsx
// Fichier complet : ajout d'un badge par commande indiquant le nombre de
// messages ADMIN non lus, sur le même principe que la liste admin.

import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrix } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";

const statutVariant: Record<string, "vert" | "rouge" | "gris"> = {
  PAYEE: "vert",
  EN_PREPARATION: "vert",
  EXPEDIEE: "vert",
  LIVREE: "vert",
  EN_ATTENTE: "gris",
  ANNULEE: "rouge",
};

export default async function CommandesPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id: string }).id;

  const commandes = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      _count: { select: { messages: { where: { auteur: "ADMIN", lu: false } } } },
    },
  });

  if (commandes.length === 0) {
    return <p className="text-sm text-encre/40">Vous n&apos;avez pas encore passé de commande.</p>;
  }

  return (
    <div className="divide-y divide-sable rounded-xl border border-sable">
      {commandes.map((commande) => (
        <Link
          key={commande.id}
          href={`/compte/commandes/${commande.numero}`}
          className="flex flex-col gap-2 p-4 hover:bg-vert-pale sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-2">
            <div>
              <p className="text-sm font-medium">{commande.numero}</p>
              <p className="text-xs text-encre/40">
                {new Date(commande.createdAt).toLocaleDateString("fr-FR")} · {commande.items.length} article(s)
              </p>
            </div>
            {commande._count.messages > 0 && (
              <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-vivrebio-rouge px-1.5 text-[11px] font-medium text-white">
                {commande._count.messages}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{formatPrix(commande.total)}</span>
            <Badge variant={statutVariant[commande.statut] ?? "gris"}>{commande.statut}</Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}