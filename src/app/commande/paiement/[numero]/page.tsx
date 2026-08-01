// src/app/commande/paiement/[numero]/page.tsx
// Ajout : ligne "Réduction (points)" séparée de "Réduction (code)", pour que
// le client voie clairement d'où vient chaque réduction.

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

  const sousTotal = commande.items.reduce((s, l) => s + l.prixUnitaire * l.quantite, 0);

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <p className="mb-6 text-xs text-encre/40">1. Panier → 2. Identification → 3. Livraison → 4. Paiement</p>

      <div className="carte-3d-forte p-6">
        <h1 className="mb-6 text-lg font-semibold text-vivrebio-vert">Récapitulatif de la commande</h1>
        <p className="mb-4 text-xs text-encre/40">Commande n° {commande.numero}</p>

        <div className="mb-4 divide-y divide-sable rounded-xl border border-sable">
          {commande.items.map((ligne) => (
            <div key={ligne.id} className="flex justify-between p-3 text-sm text-encre">
              <span>{ligne.product.nom} × {ligne.quantite}</span>
              <span>{formatPrix(ligne.prixUnitaire * ligne.quantite)}</span>
            </div>
          ))}
        </div>

        <div className="mb-6 space-y-1.5 text-sm">
          <div className="flex justify-between text-encre/60"><span>Sous-total</span><span>{formatPrix(sousTotal)}</span></div>
          {commande.montantReduction > 0 && (
            <div className="flex justify-between text-vivrebio-vert"><span>Réduction (code)</span><span>− {formatPrix(commande.montantReduction)}</span></div>
          )}
          {commande.reductionPoints > 0 && (
            <div className="flex justify-between text-vivrebio-vert">
              <span>Réduction ({commande.pointsUtilises} points)</span>
              <span>− {formatPrix(commande.reductionPoints)}</span>
            </div>
          )}
          <div className="flex justify-between text-encre/60">
            <span>{commande.modeLivraison === "RETRAIT" ? "Retrait en boutique" : "Livraison"}</span>
            <span>{commande.fraisLivraison === 0 ? "Gratuit" : formatPrix(commande.fraisLivraison)}</span>
          </div>
          <div className="flex justify-between border-t border-sable pt-1.5 text-base font-semibold text-encre">
            <span>Total à payer</span>
            <span className="text-vivrebio-vert">{formatPrix(commande.total)}</span>
          </div>
        </div>

        {commande.statut === "PAYEE" ? (
          <p className="rounded-lg bg-vert-pale p-3 text-center text-sm text-vivrebio-vert">Cette commande est déjà payée.</p>
        ) : (
          <BoutonPaiementKkiapay numero={commande.numero} montant={commande.total} />
        )}
      </div>
    </main>
  );
}