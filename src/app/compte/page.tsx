// src/app/compte/page.tsx
// Fichier complet : le vrai tableau de bord (dernière commande + total),
// à remettre si son contenu a été accidentellement remplacé par celui de
// la page parrainage.

import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrix } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";

export default async function TableauDeBordPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id: string }).id;
  const role = (session?.user as { role?: string })?.role;

  const [derniereCommande, nombreCommandes] = await Promise.all([
    prisma.order.findFirst({ where: { userId }, orderBy: { createdAt: "desc" }, include: { items: true } }),
    prisma.order.count({ where: { userId } }),
  ]);

  return (
    <div>
      <p className="mb-6 text-sm text-encre/60">
        Bienvenue {session?.user?.name ?? ""} — retrouvez ici l&apos;essentiel de votre compte Vivre Bio.
      </p>

      {role === "ADMIN" && (
        <Link href="/admin" className="mb-4 inline-block rounded-lg bg-vivrebio-rouge px-4 py-2 text-sm font-medium text-white">
          Accéder au back-office admin →
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="carte-3d p-5">
          <p className="text-xs text-encre/40">Nombre de commandes</p>
          <p className="mt-1 text-2xl font-bold text-vivrebio-vert">{nombreCommandes}</p>
        </div>

        {derniereCommande ? (
          <Link href={`/compte/commandes/${derniereCommande.numero}`} className="carte-3d p-5 hover:bg-vert-pale">
            <p className="text-xs text-encre/40">Dernière commande</p>
            <p className="mt-1 text-sm font-medium text-encre">{derniereCommande.numero}</p>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-sm text-vivrebio-vert">{formatPrix(derniereCommande.total)}</span>
              <Badge variant={derniereCommande.statut === "EN_ATTENTE" ? "gris" : "vert"}>{derniereCommande.statut}</Badge>
            </div>
          </Link>
        ) : (
          <div className="carte-3d p-5">
            <p className="text-xs text-encre/40">Dernière commande</p>
            <p className="mt-1 text-sm text-encre/50">Aucune commande pour l&apos;instant.</p>
          </div>
        )}
      </div>
    </div>
  );
}