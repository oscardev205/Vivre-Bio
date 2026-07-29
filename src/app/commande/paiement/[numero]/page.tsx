// src/app/commande/paiement/[numero]/page.tsx
// Affiche le récapitulatif de la commande et le bouton de paiement Kkiapay.

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrix } from "@/lib/format";
import { BoutonPaiementKkiapay } from "@/components/commande/BoutonPaiementKkiapay";

export default async function PaiementPage({
  params,
}: {
  params: Promise<{ numero: string }>;
}) {
  const { numero } = await params;
  const commande = await prisma.order.findUnique({
    where: { numero },
    include: { items: { include: { product: true } } },
  });

  if (!commande) notFound();

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <p className="mb-6 text-xs text-gray-400">1. Panier → 2. Identification → 3. Livraison → 4. Paiement</p>
      <h1 className="mb-6 text-lg font-semibold text-vivrebio-vert">Récapitulatif de la commande</h1>

      <p className="mb-4 text-xs text-gray-500">Commande n° {commande.numero}</p>

      <div className="mb-4 divide-y divide-gray-100 rounded-xl border border-gray-100">
        {commande.items.map((ligne) => (
          <div key={ligne.id} className="flex justify-between p-3 text-sm">
            <span>{ligne.product.nom} × {ligne.quantite}</span>
            <span>{formatPrix(ligne.prixUnitaire * ligne.quantite)}</span>
          </div>
        ))}
      </div>

      <div className="mb-6 flex justify-between text-base font-semibold">
        <span>Total à payer</span>
        <span className="text-vivrebio-vert">{formatPrix(commande.total)}</span>
      </div>

      {commande.statut === "PAYEE" ? (
        <p className="rounded-lg bg-green-50 p-3 text-center text-sm text-vivrebio-vert">
          Cette commande est déjà payée.
        </p>
      ) : (
        <BoutonPaiementKkiapay numero={commande.numero} montant={commande.total} />
      )}
    </main>
  );
}