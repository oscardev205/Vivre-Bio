// src/app/compte/commandes/[numero]/page.tsx
// Fichier complet et à jour : timeline visuelle, facture PDF téléchargeable,
// détail retrait OU livraison (avec lien Google Maps), confirmation de livraison,
// messagerie, détail code promo utilisé, détail points fidélité utilisés/gagnés.

import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrix } from "@/lib/format";
import { ConfirmerLivraisonButton } from "@/components/compte/ConfirmerLivraisonButton";
import { TimelineCommande } from "@/components/commande/TimelineCommande";
import { FilDiscussion } from "@/components/messagerie/FilDiscussion";

const STATUTS_PAYES = ["PAYEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE"];

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
    include: {
      items: { include: { product: true } },
      address: true,
      promoCode: true,
    },
  });

  if (!commande || commande.userId !== userId) notFound();

  const sousTotal = commande.items.reduce((s, l) => s + l.prixUnitaire * l.quantite, 0);

  return (
    <div>
      <p className="mb-1 text-sm font-medium text-encre">Commande {commande.numero}</p>
      <p className="mb-6 text-xs text-encre/40">
        Passée le {new Date(commande.createdAt).toLocaleDateString("fr-FR")}
      </p>

      <div className="mb-6">
        <TimelineCommande statut={commande.statut} />
      </div>

      <div className="mb-4 divide-y divide-sable rounded-xl border border-sable">
        {commande.items.map((ligne) => (
          <div key={ligne.id} className="flex justify-between p-3 text-sm text-encre">
            <span>
              {ligne.product.nom} × {ligne.quantite}
            </span>
            <span>{formatPrix(ligne.prixUnitaire * ligne.quantite)}</span>
          </div>
        ))}
      </div>

      <div className="mb-4 space-y-1.5 text-sm">
        <div className="flex justify-between text-encre/60">
          <span>Sous-total</span>
          <span>{formatPrix(sousTotal)}</span>
        </div>

        {commande.montantReduction > 0 && (
          <div className="flex justify-between text-vivrebio-vert">
            <span>Code promo{commande.promoCode ? ` (${commande.promoCode.code})` : ""}</span>
            <span>− {formatPrix(commande.montantReduction)}</span>
          </div>
        )}

        {commande.reductionPoints > 0 && (
          <div className="flex justify-between text-vivrebio-vert">
            <span>Points fidélité ({commande.pointsUtilises} points)</span>
            <span>− {formatPrix(commande.reductionPoints)}</span>
          </div>
        )}

        <div className="flex justify-between text-encre/60">
          <span>{commande.modeLivraison === "RETRAIT" ? "Retrait en boutique" : "Livraison"}</span>
          <span>{commande.fraisLivraison === 0 ? "Gratuit" : formatPrix(commande.fraisLivraison)}</span>
        </div>

        <div className="flex justify-between border-t border-sable pt-1.5 text-base font-semibold text-encre">
          <span>Total</span>
          <span className="text-vivrebio-vert">{formatPrix(commande.total)}</span>
        </div>

        {commande.pointsGagnes > 0 && (
          <p className="pt-1 text-xs text-encre/40">
            + {commande.pointsGagnes} points gagnés avec cette commande
          </p>
        )}
      </div>

      {STATUTS_PAYES.includes(commande.statut) && (
        
          <a href={`/api/commandes/${commande.numero}/facture`}
          className="mb-4 inline-block rounded-lg border border-sable px-4 py-2 text-xs font-medium text-vivrebio-vert hover:border-vivrebio-vert"
        >
          📄 Télécharger la facture
        </a>
      )}

      {commande.modeLivraison === "RETRAIT" ? (
        <div className="rounded-xl bg-vert-pale p-4 text-sm">
          <p className="mb-1 font-medium text-encre">Retrait en boutique :</p>
          <p className="text-encre/70">{commande.contactNom}</p>
          <p className="text-encre/70">{commande.contactTelephone}</p>
        </div>
      ) : commande.address ? (
        <div className="rounded-xl bg-vert-pale p-4 text-sm">
          <p className="mb-1 font-medium text-encre">Livré à :</p>
          <p className="text-encre/70">{commande.address.nomComplet}</p>
          <p className="text-encre/70">
            {commande.address.adresseDetail}, {commande.address.quartier}
          </p>
          <p className="text-encre/70">{commande.address.ville}</p>
          <p className="text-encre/70">{commande.address.telephone}</p>

          {commande.address.latitude && commande.address.longitude && (
            
           <a   href={`https://www.google.com/maps?q=${commande.address.latitude},${commande.address.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs font-medium text-vivrebio-vert hover:underline"
            >
              📍 Voir la position exacte sur la carte →
            </a>
          )}
        </div>
      ) : null}

      {commande.statut === "EXPEDIEE" && !commande.livraisonConfirmee && (
        <div className="mt-4">
          <ConfirmerLivraisonButton numero={commande.numero} />
        </div>
      )}

      <div className="mt-6">
        <FilDiscussion numero={commande.numero} />
      </div>
    </div>
  );
}