// src/app/admin/newsletter/page.tsx
// Ajout : bouton d'export CSV, pour transférer facilement la liste vers un outil
// de campagne dédié (Mailchimp, Brevo, etc.) plutôt que de recoder l'envoi en masse.

import { prisma } from "@/lib/prisma";
import { ExporterCSVButton } from "@/components/admin/ExporterCSVButton";

export default async function AdminNewsletterPage() {
  const abonnes = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-encre">{abonnes.length} abonné(s)</p>
        {abonnes.length > 0 && (
          <ExporterCSVButton
            donnees={abonnes.map((a) => ({ email: a.email, date: a.createdAt.toISOString() }))}
          />
        )}
      </div>

      <p className="mb-4 rounded-lg bg-vert-pale px-3 py-2 text-xs text-encre/70">
        💡 Pour envoyer une newsletter, exporte cette liste en CSV et importe-la dans un
        outil dédié comme Mailchimp ou Brevo (gratuits jusqu&apos;à plusieurs milliers de contacts).
      </p>

      <div className="carte-3d divide-y divide-sable">
        {abonnes.map((a) => (
          <div key={a.id} className="flex justify-between p-3 text-sm">
            <span className="text-encre">{a.email}</span>
            <span className="text-xs text-encre/40">
              {new Date(a.createdAt).toLocaleDateString("fr-FR")}
            </span>
          </div>
        ))}
        {abonnes.length === 0 && (
          <p className="p-6 text-center text-sm text-encre/40">Aucun abonné pour l&apos;instant.</p>
        )}
      </div>
    </div>
  );
}