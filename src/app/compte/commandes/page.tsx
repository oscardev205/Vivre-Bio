// src/app/compte/commandes/page.tsx
// Liste de toutes les commandes de l'utilisateur connecté, triées de la plus récente à la plus ancienne.

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
    include: { items: true },
  });

  if (commandes.length === 0) {
    return <p className="text-sm text-gray-400">Vous n&apos;avez pas encore passé de commande.</p>;
  }

  return (
    <div className="divide-y divide-gray-100 rounded-xl border border-gray-100">
      {commandes.map((commande) => (
        <Link
          key={commande.id}
          href={`/compte/commandes/${commande.numero}`}
          className="flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <div>
            <p className="text-sm font-medium">{commande.numero}</p>
            <p className="text-xs text-gray-400">
              {new Date(commande.createdAt).toLocaleDateString("fr-FR")} · {commande.items.length} article(s)
            </p>
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