// src/app/compte/fidelite/page.tsx
// Fichier complet : utilise désormais la valeur du point configurée par
// l'admin, au lieu de calculerReductionPoints() avec une constante figée.

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { POINTS_PAR_100_FCFA, getValeurPointFcfa } from "@/lib/fidelite";
import { formatPrix } from "@/lib/format";

export default async function FidelitePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id: string }).id;

  const [user, transactions, valeurPoint] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.pointsTransaction.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 }),
    getValeurPointFcfa(),
  ]);

  const points = user?.pointsFidelite ?? 0;

  return (
    <div>
      <div className="carte-3d-forte mb-6 p-6 text-center">
        <p className="text-xs text-encre/40">Votre solde</p>
        <p className="mt-1 text-3xl font-bold text-vivrebio-vert">{points} points</p>
        <p className="mt-1 text-sm text-encre/50">Équivalent à {formatPrix(points * valeurPoint)}</p>
        <p className="mt-3 text-xs text-encre/40">
          Vous gagnez {POINTS_PAR_100_FCFA} point tous les 100 FCFA dépensés — utilisables dès votre prochain panier.
        </p>
      </div>

      <p className="mb-3 text-sm font-medium text-encre">Historique</p>
      <div className="carte-3d divide-y divide-sable">
        {transactions.map((t) => (
          <div key={t.id} className="flex justify-between p-3 text-sm">
            <div>
              <p className="text-encre">{t.motif}</p>
              <p className="text-xs text-encre/40">{new Date(t.createdAt).toLocaleDateString("fr-FR")}</p>
            </div>
            <span className={t.montant > 0 ? "font-medium text-vivrebio-vert" : "font-medium text-vivrebio-rouge"}>
              {t.montant > 0 ? "+" : ""}{t.montant}
            </span>
          </div>
        ))}
        {transactions.length === 0 && <p className="p-6 text-center text-sm text-encre/40">Aucune transaction pour l&apos;instant.</p>}
      </div>
    </div>
  );
}