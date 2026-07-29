// src/app/compte/commandes/[numero]/page.tsx
// Détail d'une commande — vérifie que la commande appartient bien à l'utilisateur connecté
// avant de l'afficher (sécurité : on ne doit jamais pouvoir voir la commande de quelqu'un d'autre).

import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrix } from "@/lib/format";

export default async function DetailCommandePage({
  params,
}: {
  params: Promise<{ numero: string }>;
}) {
  const { numero } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id: string }).id;

  const commande = await prisma.order.findUnique({
    where: { numero },
    include: { items: { include: { product: true } }, address: true },
  });

  // Sécurité : la commande doit exister ET appartenir à l'utilisateur connecté
  if (!commande || commande.userId !== userId) notFound();

  return (
    <div>
      <p className="mb-1 text-sm font-medium">Commande {commande.numero}</p>
      <p className="mb-6 text-xs text-gray-400">
        Passée le {new Date(commande.createdAt).toLocaleDateString("fr-FR")} · Statut : {commande.statut}
      </p>

      <div className="mb-4 divide-y divide-gray-100 rounded-xl border border-gray-100">
        {commande.items.map((ligne) => (
          <div key={ligne.id} className="flex justify-between p-3 text-sm">
            <span>{ligne.product.nom} × {ligne.quantite}</span>
            <span>{formatPrix(ligne.prixUnitaire * ligne.quantite)}</span>
          </div>
        ))}
      </div>

      <div className="mb-6 flex justify-between text-base font-semibold">
        <span>Total</span>
        <span className="text-vivrebio-vert">{formatPrix(commande.total)}</span>
      </div>

      <div className="rounded-xl bg-gray-50 p-4 text-sm">
        <p className="mb-1 font-medium">Livré à :</p>
        <p className="text-gray-600">{commande.address.nomComplet}</p>
        <p className="text-gray-600">{commande.address.adresseDetail}, {commande.address.quartier}</p>
        <p className="text-gray-600">{commande.address.ville}</p>
        <p className="text-gray-600">{commande.address.telephone}</p>
      </div>
    </div>
  );
}