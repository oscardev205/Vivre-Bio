// src/components/layout/Footer.tsx
// Fichier complet : logo posé dans une petite carte blanche arrondie, pour
// bien ressortir sur le fond vert foncé du footer sans que le fond turquoise
// opaque du logo ne jure visuellement. À simplifier (juste le logo, sans carte)
// le jour où tu as une version à fond transparent.

import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa6";
import { NewsletterForm } from "@/components/layout/NewsletterForm";

export function Footer() {
  return (
    <footer className="mt-20 bg-footer-bg text-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="inline-block rounded-xl bg-white p-2">
              <Image src="/logoV.png" alt="Vivre Bio" width={130} height={40} className="h-9 w-auto" />
            </div>
            <p className="mt-3 text-sm text-white/60">
              Le meilleur de la nature pour vous.
            </p>
            <div className="mt-4 flex gap-3">
              
              <a  href="https://facebook.com/vivrebio"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Vivre Bio sur Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-vivrebio-vert"
              >
                <FaFacebook size={16} />
              </a>
              
               <a href="https://instagram.com/vivrebio"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Vivre Bio sur Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-vivrebio-vert"
              >
                <FaInstagram size={16} />
              </a>
              
               <a href="https://tiktok.com/@vivrebio"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Vivre Bio sur TikTok"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-vivrebio-vert"
              >
                <FaTiktok size={16} />
              </a>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/50">
              Boutique
            </p>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/boutique" className="hover:text-white">Tous les produits</Link></li>
              <li><Link href="/boutique?categorie=huiles-essentielles" className="hover:text-white">Huiles essentielles</Link></li>
              <li><Link href="/boutique?categorie=huiles-vegetales" className="hover:text-white">Huiles végétales</Link></li>
              <li><Link href="/boutique?categorie=infusions" className="hover:text-white">Infusions</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/50">
              Informations
            </p>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link href="/livraison" className="hover:text-white">Livraison</Link></li>
              <li><Link href="/cgv" className="hover:text-white">Conditions générales de vente</Link></li>
              <li><Link href="/politique-de-confidentialite" className="hover:text-white">Politique de confidentialité</Link></li>
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/50">
              Restons en contact
            </p>
            <p className="mb-3 text-sm text-white/60">Recevez nos nouveautés et offres.</p>
            <NewsletterForm />
            <p className="mt-2 text-[11px] text-white/40">
              <a href="/desabonnement" className="hover:underline">Se désabonner</a>
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 md:flex-row">
          <span>© {new Date().getFullYear()} Vivre Bio. Tous droits réservés.</span>
          <a href="https://boost-expertise.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:underline">
            <span>Réalisé par Boost-Expertise</span>
          </a>
          <a href="https://maps.google.com/?q=Porto-Novo,+Bénin" target="_blank" rel="noopener noreferrer" className="hover:underline">
            <span>Porto-novo, Bénin</span>
          </a>
        </div>
      </div>
    </footer>
  );
}