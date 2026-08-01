// src/app/a-propos/page.tsx
// Page enrichie : hero narratif, histoire, mission/vision, valeurs, engagement qualité
// en 4 étapes, chiffres clés tirés de la vraie base de données, CTA final.

import Link from "next/link";
import { FaLeaf, FaHeart, FaAward, FaBolt, FaSeedling, FaMagnifyingGlass, FaBoxOpen, FaTruckFast, FaStar } from "react-icons/fa6";
import { TraitFeuille } from "@/components/ui/TraitFeuille";
import { FadeIn } from "@/components/ui/FadeIn";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";

export default async function AProposPage() {
  const [nombreProduits, nombreCategories, statsAvis] = await Promise.all([
    prisma.product.count({ where: { actif: true } }),
    prisma.category.count(),
    prisma.review.aggregate({ _avg: { note: true }, _count: true }),
  ]);

  const noteMoyenne = statsAvis._avg.note ? statsAvis._avg.note.toFixed(1) : null;

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      {/* Hero */}
      <FadeIn>
        <p className="text-xs font-semibold uppercase tracking-wide text-vivrebio-rouge">
          Notre histoire
        </p>
        <h1 className="mt-1 text-2xl font-bold text-encre sm:text-3xl">À propos de Vivre Bio</h1>
        <TraitFeuille className="mt-2" />
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-encre/70">
          Vivre Bio est née d&apos;une conviction simple : la nature offre déjà tout ce dont
          notre corps a besoin pour rester en bonne santé. Basée à Cotonou, notre entreprise
          sélectionne et propose des huiles essentielles, huiles végétales, poudres, infusions
          et cosmétiques naturels, pensés pour accompagner votre bien-être au quotidien.
        </p>
      </FadeIn>

      {/* Chiffres clés (données réelles) */}
      <FadeIn delai={100} className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="carte-3d p-4 text-center">
          <p className="text-2xl font-bold text-vivrebio-vert">{nombreProduits}+</p>
          <p className="mt-1 text-xs text-encre/50">Produits naturels</p>
        </div>
        <div className="carte-3d p-4 text-center">
          <p className="text-2xl font-bold text-vivrebio-vert">{nombreCategories}</p>
          <p className="mt-1 text-xs text-encre/50">Catégories</p>
        </div>
        <div className="carte-3d col-span-2 p-4 text-center sm:col-span-1">
          {noteMoyenne ? (
            <>
              <p className="flex items-center justify-center gap-1 text-2xl font-bold text-vivrebio-vert">
                <FaStar className="text-yellow-400" size={18} /> {noteMoyenne}
              </p>
              <p className="mt-1 text-xs text-encre/50">Note moyenne clients</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-vivrebio-vert">100%</p>
              <p className="mt-1 text-xs text-encre/50">Naturel &amp; bio</p>
            </>
          )}
        </div>
      </FadeIn>

      {/* Notre histoire, en détail */}
      <FadeIn delai={150} className="mt-12">
        <div className="carte-3d p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-vivrebio-rouge">Depuis nos débuts</p>
          <h2 className="mt-1 text-lg font-bold text-encre">Une aventure au service du naturel</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-encre/70">
            <p>
              Tout a commencé par un constat : trouver des produits véritablement naturels,
              sans additifs superflus, restait souvent compliqué. Vivre Bio est née pour
              simplifier cette recherche, en réunissant en un seul endroit des huiles
              essentielles, huiles végétales, poudres et infusions choisies avec la même
              exigence que celle qu&apos;on attendrait pour sa propre famille.
            </p>
            <p>
              Chaque produit de notre catalogue est sélectionné en privilégiant des méthodes
              de production respectueuses — première pression à froid, séchage naturel,
              absence de conservateurs artificiels — et des filières locales et régionales
              lorsque c&apos;est possible, pour soutenir aussi les producteurs de la région.
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Mission & Vision */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <FadeIn className="carte-3d p-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-vert-pale">
            <FaSeedling className="text-vivrebio-vert" />
          </div>
          <p className="text-sm font-semibold text-encre">Notre mission</p>
          <p className="mt-2 text-sm leading-relaxed text-encre/60">
            Rendre accessibles des produits naturels de qualité, sélectionnés avec exigence,
            pour accompagner durablement la santé et le bien-être de chacun.
          </p>
        </FadeIn>
        <FadeIn delai={100} className="carte-3d p-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-vert-pale">
            <FaLeaf className="text-vivrebio-vert" />
          </div>
          <p className="text-sm font-semibold text-encre">Notre vision</p>
          <p className="mt-2 text-sm leading-relaxed text-encre/60">
            Devenir la référence des produits naturels et bio au Bénin, reconnue pour la
            qualité de sa sélection et la confiance de sa communauté de clients.
          </p>
        </FadeIn>
      </div>

      {/* Valeurs de marque */}
      <div className="mt-12">
        <FadeIn>
          <p className="text-xs font-semibold uppercase tracking-wide text-vivrebio-rouge">Nos engagements</p>
          <h2 className="mt-1 text-lg font-bold text-encre">Ce qui nous guide</h2>
          <TraitFeuille className="mt-2" />
        </FadeIn>

        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { icon: FaLeaf, label: "Naturel", texte: "Inspiré par la nature et le respect de l'environnement." },
            { icon: FaHeart, label: "Santé", texte: "Pour le bien-être et la santé du consommateur." },
            { icon: FaAward, label: "Authenticité", texte: "Des produits vrais, sains et de qualité." },
            { icon: FaBolt, label: "Vitalité", texte: "Énergie, fraîcheur et dynamisme au quotidien." },
          ].map(({ icon: Icon, label, texte }, i) => (
            <FadeIn key={label} delai={i * 100} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-vert-pale">
                <Icon className="text-xl text-vivrebio-vert" />
              </div>
              <p className="mt-3 text-sm font-semibold text-encre">{label}</p>
              <p className="mt-1 text-xs text-encre/50">{texte}</p>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Notre engagement qualité, en 4 étapes */}
      <div className="mt-14">
        <FadeIn>
          <p className="text-xs font-semibold uppercase tracking-wide text-vivrebio-rouge">De la sélection à votre porte</p>
          <h2 className="mt-1 text-lg font-bold text-encre">Notre engagement qualité</h2>
          <TraitFeuille className="mt-2" />
        </FadeIn>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: FaSeedling, titre: "Sélection", texte: "Nous choisissons chaque produit avec exigence, en privilégiant les méthodes naturelles." },
            { icon: FaMagnifyingGlass, titre: "Contrôle", texte: "Chaque référence est vérifiée avant d'intégrer notre catalogue." },
            { icon: FaBoxOpen, titre: "Préparation", texte: "Vos commandes sont préparées avec soin, dans le respect des produits." },
            { icon: FaTruckFast, titre: "Livraison", texte: "Livraison suivie, jusqu'à la position exacte que vous choisissez." },
          ].map(({ icon: Icon, titre, texte }, i) => (
            <FadeIn key={titre} delai={i * 80} className="carte-3d p-5 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-vert-pale">
                <Icon className="text-vivrebio-vert" />
              </div>
              <p className="mt-3 text-sm font-semibold text-encre">{titre}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-encre/50">{texte}</p>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* CTA final */}
      <FadeIn className="mt-14 rounded-3xl bg-vert-pale p-8 text-center sm:p-10">
        <p className="text-lg font-bold text-encre">Prêt à découvrir nos produits ?</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-encre/60">
          Explorez notre catalogue et trouvez les produits naturels adaptés à vos besoins.
        </p>
        <Link href="/boutique">
          <Button className="mt-5">Découvrir la boutique</Button>
        </Link>
      </FadeIn>
    </main>
  );
}