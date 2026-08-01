// src/app/cgv/page.tsx
// Conditions générales de vente — trame de base, à faire relire par un professionnel
// avant mise en production réelle (ceci n'est pas un conseil juridique).

export default function CGVPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-encre">Conditions générales de vente</h1>

      <div className="space-y-6 text-sm leading-relaxed text-encre/80">
        <section>
          <h2 className="mb-2 text-base font-semibold text-encre">Commandes</h2>
          <p>
            Toute commande passée sur ce site implique l&apos;acceptation des présentes conditions.
            Les commandes peuvent être passées avec ou sans création de compte.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-encre">Prix et paiement</h2>
          <p>
            Les prix sont indiqués en Francs CFA (FCFA), toutes taxes comprises. Le paiement s&apos;effectue
            par Mobile Money ou carte bancaire via notre prestataire sécurisé Kkiapay.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-encre">Livraison</h2>
          <p>
            Les délais et frais de livraison sont indiqués lors du passage de commande et varient selon
            la zone géographique. Voir notre page Livraison pour le détail.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-encre">Retours et remboursements</h2>
          <p>
            Pour toute réclamation concernant un produit reçu, contactez-nous dans les 48h suivant la
            livraison via la page Contact.
          </p>
        </section>
      </div>
    </main>
  );
}