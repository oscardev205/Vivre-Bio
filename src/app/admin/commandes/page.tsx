// src/app/admin/commandes/page.tsx
// Fichier complet : chaque ligne passe en colonne sur mobile (infos en haut,
// montant/badge en dessous), au lieu de tout aligner horizontalement et
// forcer un débordement.

import Link from "next/link";
import clsx from "clsx";
import { prisma } from "@/lib/prisma";
import { formatPrix } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";

const STATUTS = ["EN_ATTENTE", "PAYEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE", "ANNULEE"] as const;

export default async function AdminCommandesPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string; q?: string }>;
}) {
  const { statut, q } = await searchParams;

  const commandes = await prisma.order.findMany({
    where: {
      ...(statut ? { statut: statut as (typeof STATUTS)[number] } : {}),
      ...(q
        ? {
            OR: [
              { numero: { contains: q, mode: "insensitive" } },
              { nomInvite: { contains: q, mode: "insensitive" } },
              { emailInvite: { contains: q, mode: "insensitive" } },
              { user: { nom: { contains: q, mode: "insensitive" } } },
              { user: { email: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      _count: { select: { messages: { where: { auteur: "CLIENT", lu: false } } } },
    },
  });

  return (
    <div>
      <form method="get" className="mb-4 flex flex-col gap-2 sm:flex-row">
        {statut && <input type="hidden" name="statut" value={statut} />}
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Numéro, nom ou e-mail du client..."
          className="min-w-0 flex-1 rounded-lg border border-sable px-3 py-2 text-sm"
        />
        <button type="submit" className="shrink-0 rounded-lg border border-sable px-3 py-2 text-sm text-encre/70">
          Rechercher
        </button>
      </form>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href={q ? `/admin/commandes?q=${q}` : "/admin/commandes"}
          className={clsx(
            "rounded-full border px-3 py-1 text-xs font-medium",
            !statut ? "border-vivrebio-vert bg-vivrebio-vert text-white" : "border-sable text-encre/60"
          )}
        >
          Toutes
        </Link>
        {STATUTS.map((s) => (
          <Link
            key={s}
            href={`/admin/commandes?statut=${s}${q ? `&q=${q}` : ""}`}
            className={clsx(
              "rounded-full border px-3 py-1 text-xs font-medium",
              statut === s ? "border-vivrebio-vert bg-vivrebio-vert text-white" : "border-sable text-encre/60"
            )}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="divide-y divide-sable rounded-xl border border-sable">
        {commandes.map((commande) => (
          <Link
            key={commande.id}
            href={`/admin/commandes/${commande.numero}`}
            className="flex flex-col gap-2 p-3 text-sm hover:bg-vert-pale sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-2">
              <div>
                <p className="font-medium text-encre">{commande.numero}</p>
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
              <Badge variant={commande.statut === "EN_ATTENTE" ? "gris" : commande.statut === "ANNULEE" ? "rouge" : "vert"}>
                {commande.statut}
              </Badge>
            </div>
          </Link>
        ))}
        {commandes.length === 0 && (
          <p className="p-6 text-center text-sm text-encre/40">Aucune commande trouvée.</p>
        )}
      </div>
    </div>
  );
}