// src/app/admin/commandes/[numero]/page.tsx
// Fichier complet et à jour : sélecteur de statut, timeline visuelle, infos
// client, détail retrait OU livraison (avec lien Google Maps), assignation
// d'un livreur (nouveau), facture PDF, détail code promo/points, messagerie.

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrix } from "@/lib/format";
import { StatutCommandeForm } from "@/components/admin/StatutCommandeForm";
import { TimelineCommande } from "@/components/commande/TimelineCommande";
import { FilDiscussion } from "@/components/messagerie/FilDiscussion";
import { AssignerLivreurForm } from "@/components/admin/AssignerLivreurForm";

const STATUTS_PAYES = ["PAYEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE"];

export default async function AdminDetailCommandePage({
  params,
}: {
  params: Promise<{ numero: string }>;
}) {
  const { numero } = await params;

  const commande = await prisma.order.findUnique({
    where: { numero },
    include: {
      items: { include: { product: true } },
      address: true,
      user: true,
      promoCode: true,
      livreur: { select: { id: true, nom: true, telephone: true } },
    },
  });

  if (!commande) notFound();

  const nomClient = commande.user?.nom ?? commande.nomInvite ?? commande.contactNom ?? "Client invité";
  const emailClient = commande.user?.email ?? commande.emailInvite ?? "—";
  const telephoneClient = commande.user?.telephone ?? commande.telephoneInvite ?? commande.contactTelephone ?? "—";
  const sousTotal = commande.items.reduce((s, l) => s + l.prixUnitaire * l.quantite, 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-encre">{commande.numero}</p>
          <p className="text-xs text-encre/40">
            Passée le {new Date(commande.createdAt).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <StatutCommandeForm numero={commande.numero} statutActuel={commande.statut} />
      </div>

      <div className="mb-6">
        <TimelineCommande statut={commande.statut} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-sable p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-encre/40">Client</p>
          <p className="text-sm text-encre">{nomClient}</p>
          <p className="text-sm text-encre/70">{emailClient}</p>
          <p className="text-sm text-encre/70">{telephoneClient}</p>
        </div>

        <div className="rounded-xl border border-sable p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-encre/40">
            {commande.modeLivraison === "RETRAIT" ? "Retrait en boutique" : "Livraison"}
          </p>

          {commande.modeLivraison === "RETRAIT" ? (
            <>
              <p className="text-sm text-encre/70">{commande.contactNom}</p>
              <p className="text-sm text-encre/70">{commande.contactTelephone}</p>
            </>
          ) : commande.address ? (
            <>
              <p className="text-sm text-encre/70">
                {commande.address.adresseDetail}, {commande.address.quartier}
              </p>
              <p className="text-sm text-encre/70">{commande.address.ville}</p>

              {commande.address.latitude && commande.address.longitude && (
                
                <a  href={`https://www.google.com/maps?q=${commande.address.latitude},${commande.address.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs font-medium text-vivrebio-vert hover:underline"
                >
                  📍 Voir sur la carte →
                </a>
              )}
            </>
          ) : (
            <p className="text-sm text-encre/40">Adresse non renseignée.</p>
          )}
        </div>
      </div>

      {commande.modeLivraison === "LIVRAISON" && (
        <div className="mt-4">
          {commande.livreur && (
            <p className="mb-2 text-xs text-encre/50">
              Actuellement assignée à <strong className="text-encre">{commande.livreur.nom ?? "Sans nom"}</strong>
              {commande.livraisonConfirmeePar && (
                <> · confirmée par {commande.livraisonConfirmeePar === "LIVREUR" ? "le livreur" : "le client"}</>
              )}
            </p>
          )}
          <AssignerLivreurForm numero={commande.numero} livreurActuelId={commande.livreurId} />
        </div>
      )}

      <div className="mt-4 divide-y divide-sable rounded-xl border border-sable">
        {commande.items.map((ligne) => (
          <div key={ligne.id} className="flex justify-between p-3 text-sm text-encre">
            <span>
              {ligne.product.nom} × {ligne.quantite}
            </span>
            <span>{formatPrix(ligne.prixUnitaire * ligne.quantite)}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-1.5 text-sm">
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
          <span>{commande.modeLivraison === "RETRAIT" ? "Retrait" : "Livraison"}</span>
          <span>{commande.fraisLivraison === 0 ? "Gratuit" : formatPrix(commande.fraisLivraison)}</span>
        </div>

        <div className="flex justify-between border-t border-sable pt-1.5 text-base font-semibold text-encre">
          <span>Total</span>
          <span className="text-vivrebio-vert">{formatPrix(commande.total)}</span>
        </div>

        {commande.pointsGagnes > 0 && (
          <p className="pt-1 text-xs text-encre/40">
            Le client a gagné {commande.pointsGagnes} points avec cette commande
          </p>
        )}
      </div>

      {STATUTS_PAYES.includes(commande.statut) && (
        
         <a href={`/api/commandes/${commande.numero}/facture`}
          className="mt-4 inline-block rounded-lg border border-sable px-4 py-2 text-xs font-medium text-vivrebio-vert hover:border-vivrebio-vert"
        >
          📄 Télécharger la facture
        </a>
      )}

      <div className="mt-6">
        <FilDiscussion numero={commande.numero} />
      </div>
    </div>
  );
}