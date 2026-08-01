// src/app/politique-de-confidentialite/page.tsx
// Politique de confidentialité — reflète les données réellement collectées par le site
// (achat invité, inscription, adresse de livraison, paiement via prestataire tiers).

export default function PolitiqueConfidentialitePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-encre">Politique de confidentialité</h1>

      <div className="space-y-6 text-sm leading-relaxed text-encre/80">
        <section>
          <h2 className="mb-2 text-base font-semibold text-encre">Données que nous collectons</h2>
          <p>
            Lors d&apos;une commande (avec ou sans création de compte), nous collectons : votre nom,
            numéro de téléphone, adresse e-mail, et adresse de livraison (ville, quartier, adresse
            détaillée et, si vous l&apos;autorisez, votre position exacte via la carte). Ces informations
            sont utilisées uniquement pour traiter et livrer votre commande.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-encre">Paiement</h2>
          <p>
            Les paiements sont traités par notre prestataire Kkiapay. Vivre Bio ne stocke jamais vos
            informations de carte bancaire ou vos identifiants Mobile Money — ces données transitent
            uniquement entre vous et Kkiapay.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-encre">Conservation des données</h2>
          <p>
            Vos données de commande sont conservées le temps nécessaire à la gestion de la relation
            commerciale et aux obligations légales de facturation. Si vous créez un compte, vous pouvez
            demander la suppression de vos données à tout moment en nous contactant.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-encre">Vos droits</h2>
          <p>
            Vous pouvez à tout moment demander l&apos;accès, la correction ou la suppression de vos
            données personnelles en nous contactant via la page Contact.
          </p>
        </section>
      </div>
    </main>
  );
}