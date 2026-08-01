// src/app/page.tsx
// Refonte enrichie : hero avec composition de feuilles plus vivante, section
// "Comment ça marche", 6 produits phares (au lieu de 3), et témoignages clients
// tirés des vrais avis laissés sur les produits.

import Link from "next/link";
import { FaLeaf, FaHeart, FaAward, FaBolt, FaBasketShopping, FaLock, FaTruckFast, FaStar } from "react-icons/fa6";
import { Button } from "@/components/ui/Button";
import { TraitFeuille } from "@/components/ui/TraitFeuille";
import { FadeIn } from "@/components/ui/FadeIn";
import { ProductCard } from "@/components/produits/ProductCard";
import { getProduitsPhares, getAvisRecents } from "@/lib/produits";

export default async function Home() {
  const [produitsPhares, avisRecents] = await Promise.all([
    getProduitsPhares(6),
    getAvisRecents(4),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="mt-6 grid gap-8 md:mt-8 md:grid-cols-2 md:items-center md:gap-12">
        <FadeIn>
          <span className="inline-block rounded-full bg-vivrebio-rouge/10 px-3 py-1 text-xs font-medium text-vivrebio-rouge">
            100% naturel &amp; bio
          </span>

          <h1 className="mt-5 text-2xl font-bold leading-tight text-encre sm:text-3xl md:text-4xl">
            Le meilleur de la nature,<br />pensé pour votre santé.
          </h1>
          <TraitFeuille className="mt-3" />

          <p className="mt-4 max-w-md text-sm text-encre/60">
            Huiles essentielles, huiles végétales, poudres, infusions et cosmétiques
            naturels — sélectionnés avec exigence, pour votre bien-être au quotidien.
            Chaque produit de notre catalogue est choisi pour sa qualité, son origine
            et son efficacité, afin de vous accompagner naturellement, jour après jour.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/boutique">
              <Button>Découvrir la boutique</Button>
            </Link>
            <Link href="/a-propos">
              <Button variant="outline">Nos valeurs</Button>
            </Link>
          </div>
        </FadeIn>

        {/* Visuel hero enrichi : composition de plusieurs feuilles à tailles/rotations
            variées, plus dynamique qu'une seule icône centrée */}
        <FadeIn delai={150} className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-vert-pale">
          <FaLeaf className="absolute left-[8%] top-[12%] rotate-[-25deg] text-3xl text-vivrebio-vert/20 sm:text-4xl" />
          <FaLeaf className="absolute right-[12%] top-[20%] rotate-[18deg] text-2xl text-vivrebio-vert-clair/35 sm:text-3xl" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FaLeaf className="text-6xl text-vivrebio-vert/25 sm:text-7xl md:text-8xl" />
          </div>
          <FaLeaf className="absolute bottom-[15%] left-[18%] rotate-[12deg] text-2xl text-vivrebio-vert-clair/30 sm:text-3xl" />
          <FaLeaf className="absolute bottom-[10%] right-[10%] rotate-[-15deg] text-4xl text-vivrebio-vert/15 sm:text-5xl" />
          <div className="absolute right-[6%] top-[8%] h-16 w-16 rounded-full border-2 border-dashed border-vivrebio-vert/15" />
        </FadeIn>
      </section>

      {/* Comment ça marche */}
      <section className="mt-14 md:mt-20">
        <FadeIn>
          <p className="text-xs font-semibold uppercase tracking-wide text-vivrebio-rouge">
            Simple et rapide
          </p>
          <h2 className="mt-1 text-lg font-bold text-encre sm:text-xl">Comment ça marche</h2>
          <TraitFeuille className="mt-2" />
          <p className="mt-3 max-w-xl text-sm text-encre/60">
            Commander vos produits naturels préférés n&apos;a jamais été aussi simple — que vous
            soyez déjà client ou que ce soit votre première visite.
          </p>
        </FadeIn>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            { icon: FaBasketShopping, titre: "Choisissez vos produits", texte: "Parcourez notre catalogue et ajoutez vos coups de cœur au panier." },
            { icon: FaLock, titre: "Commandez en confiance", texte: "Payez en toute sécurité via Mobile Money ou carte bancaire, sans créer de compte si vous le souhaitez." },
            { icon: FaTruckFast, titre: "Recevez chez vous", texte: "Choisissez votre position exacte sur la carte et suivez votre livraison jusqu'à votre porte." },
          ].map(({ icon: Icon, titre, texte }, i) => (
            <FadeIn key={titre} delai={i * 100} className="carte-3d p-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-vert-pale">
                <Icon className="text-lg text-vivrebio-vert" />
              </div>
              <p className="mt-3 text-sm font-semibold text-encre">{titre}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-encre/50">{texte}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Valeurs de marque */}
      <section className="mt-14 md:mt-20">
        <FadeIn>
          <p className="text-xs font-semibold uppercase tracking-wide text-vivrebio-rouge">
            Nos engagements
          </p>
          <h2 className="mt-1 text-lg font-bold text-encre sm:text-xl">Pourquoi Vivre Bio</h2>
          <TraitFeuille className="mt-2" />
        </FadeIn>

        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { icon: FaLeaf, label: "Naturel", texte: "Inspiré par la nature et son respect" },
            { icon: FaHeart, label: "Santé", texte: "Pour votre bien-être au quotidien" },
            { icon: FaAward, label: "Authenticité", texte: "Des produits vrais et de qualité" },
            { icon: FaBolt, label: "Vitalité", texte: "Énergie et fraîcheur naturelles" },
          ].map(({ icon: Icon, label, texte }, i) => (
            <FadeIn key={label} delai={i * 100} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-vert-pale transition-transform hover:scale-110 sm:h-14 sm:w-14">
                <Icon className="text-lg text-vivrebio-vert sm:text-xl" />
              </div>
              <p className="mt-3 text-sm font-semibold text-encre">{label}</p>
              <p className="mt-1 text-xs text-encre/50">{texte}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Produits phares */}
      <section className="mt-14 md:mt-20">
        <FadeIn className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-vivrebio-rouge">
              Sélection
            </p>
            <h2 className="mt-1 text-lg font-bold text-encre sm:text-xl">Nos produits phares</h2>
            <TraitFeuille className="mt-2" />
          </div>
          <Link href="/boutique" className="text-sm font-medium text-vivrebio-vert hover:underline">
            Tout voir →
          </Link>
        </FadeIn>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {produitsPhares.map((produit, i) => (
            <FadeIn key={produit.id} delai={(i % 3) * 100}>
              <ProductCard produit={produit} />
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Témoignages clients (avis réels) */}
      {avisRecents.length > 0 && (
        <section className="mt-14 mb-16 md:mt-20">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-wide text-vivrebio-rouge">
              Ils nous font confiance
            </p>
            <h2 className="mt-1 text-lg font-bold text-encre sm:text-xl">Ce que disent nos clients</h2>
            <TraitFeuille className="mt-2" />
          </FadeIn>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {avisRecents.map((avis, i) => (
              <FadeIn key={avis.id} delai={i * 100} className="carte-3d p-5">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <FaStar key={n} size={12} className={n <= avis.note ? "text-yellow-400" : "text-sable-fonce"} />
                  ))}
                </div>
                <p className="mt-3 text-sm text-encre/70">&laquo; {avis.commentaire} &raquo;</p>
                <p className="mt-3 text-xs font-medium text-encre">
                  {avis.user.nom ?? "Client Vivre Bio"}
                  <span className="font-normal text-encre/40"> · {avis.product.nom}</span>
                </p>
              </FadeIn>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}