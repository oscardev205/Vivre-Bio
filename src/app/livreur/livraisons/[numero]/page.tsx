// src/app/livreur/livraisons/[numero]/page.tsx
// Détail d'une livraison — réutilise le même style de carte que côté client/admin.
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrix } from "@/lib/format";
import { BoutonConfirmerLivraisonLivreur } from "@/components/livreur/BoutonConfirmerLivraisonLivreur";

export default async function DetailLivraisonPage({
  params,
}: {
  params: Promise<{ numero: string }>;
}) {
  const { numero } = await params;
  const session = await getServerSession(authOptions);
  const livreurId = (session?.user as { id: string })?.id;

  const commande = await prisma.order.findUnique({
    where: { numero },
    include: { items: { include: { product: true } }, address: true, user: true },
  });

  if (!commande || commande.livreurId !== livreurId) notFound();

  return (
    <div>
      <p className="mb-1 text-sm font-medium text-encre">Commande {commande.numero}</p>
      <p className="mb-6 text-xs text-encre/40">Statut : {commande.statut}</p>

      <div className="carte-3d mb-4 p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-encre/40">Client</p>
        <p className="text-sm text-encre">{commande.user?.nom ?? commande.nomInvite}</p>
        <p className="text-sm text-encre/70">{commande.user?.telephone ?? commande.telephoneInvite}</p>
      </div>

      {commande.address && (
        <div className="carte-3d mb-4 p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-encre/40">Adresse</p>
          <p className="text-sm text-encre/70">{commande.address.adresseDetail}, {commande.address.quartier}</p>
          <p className="text-sm text-encre/70">{commande.address.ville}</p>
          {commande.address.latitude && commande.address.longitude && (
            
           <a   href={`https://www.google.com/maps?q=${commande.address.latitude},${commande.address.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs font-medium text-vivrebio-vert hover:underline"
            >
              📍 Voir sur la carte →
            </a>
          )}
        </div>
      )}

      <div className="mb-4 divide-y divide-sable rounded-xl border border-sable">
        {commande.items.map((ligne) => (
          <div key={ligne.id} className="flex justify-between p-3 text-sm text-encre">
            <span>{ligne.product.nom} × {ligne.quantite}</span>
            <span>{formatPrix(ligne.prixUnitaire * ligne.quantite)}</span>
          </div>
        ))}
      </div>

      {commande.statut === "EXPEDIEE" && (
        <BoutonConfirmerLivraisonLivreur numero={commande.numero} />
      )}
      {commande.statut === "LIVREE" && (
        <p className="rounded-lg bg-vert-pale p-3 text-center text-sm text-vivrebio-vert">Livraison confirmée ✓</p>
      )}
    </div>
  );
}