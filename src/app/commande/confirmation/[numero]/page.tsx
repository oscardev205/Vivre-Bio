// src/app/commande/confirmation/[numero]/page.tsx
// Mise à jour visuelle : icône et couleurs cohérentes, message posé sur une carte 3D,
// petite touche d'animation à l'arrivée (FadeIn) pour marquer ce moment important.

import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrix } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ numero: string }>;
}) {
  const { numero } = await params;
  const commande = await prisma.order.findUnique({ where: { numero } });

  if (!commande) notFound();

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <FadeIn>
        <div className="carte-3d-forte p-8 text-center">
          {commande.statut === "PAYEE" ? (
            <>
              <CheckCircle2 className="mx-auto mb-4 text-vivrebio-vert" size={48} />
              <h1 className="text-lg font-semibold text-vivrebio-vert">Commande confirmée !</h1>
              <p className="mt-2 text-sm text-encre/60">
                Merci pour votre commande n° {commande.numero}. Un e-mail de confirmation vous a été envoyé.
              </p>
              <p className="mt-3 text-sm font-medium text-encre">Total payé : {formatPrix(commande.total)}</p>
            </>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-vivrebio-rouge">Paiement en attente</h1>
              <p className="mt-2 text-sm text-encre/60">
                Votre commande n° {commande.numero} n&apos;est pas encore confirmée comme payée.
              </p>
            </>
          )}
          <Link href="/boutique"><Button className="mt-6">Continuer mes achats</Button></Link>
        </div>
      </FadeIn>
    </main>
  );
}