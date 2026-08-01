// src/app/contact/page.tsx
// Ajout : numéro de téléphone cliquable (appel direct) et WhatsApp direct
// (conversation individuelle, différent du groupe et de la chaîne).

import {
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa6";
import { ContactForm } from "@/components/contact/ContactForm";
import { TraitFeuille } from "@/components/ui/TraitFeuille";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-vivrebio-rouge">
        Contactez-nous
      </p>

      <h1 className="mt-1 text-2xl font-bold text-encre">
        Une question ?
      </h1>

      <TraitFeuille className="mt-2" />

      <p className="mt-4 text-sm text-encre/60">
        Écrivez-nous via le formulaire, ou retrouvez-nous directement sur nos
        canaux habituels.
      </p>

      <div className="mt-8 grid gap-10 md:grid-cols-2">
        <ContactForm />

        {/* Coordonnées et réseaux */}
        <div className="space-y-3">
          <a
            href="tel:+22900000000"
            className="flex items-center gap-3 rounded-xl border border-sable p-3.5 transition hover:border-vivrebio-vert"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-vert-pale text-vivrebio-vert">
              <FaPhone size={14} />
            </span>

            <div>
              <p className="text-sm font-medium text-encre">
                Téléphone
              </p>
              <p className="text-xs text-encre/50">
                +229 00 00 00 00
              </p>
            </div>
          </a>

          <a
            href="https://wa.me/22900000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-sable p-3.5 transition hover:border-vivrebio-vert"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-vert-pale text-vivrebio-vert">
              <FaWhatsapp size={15} />
            </span>

            <div>
              <p className="text-sm font-medium text-encre">
                WhatsApp direct
              </p>
              <p className="text-xs text-encre/50">
                Discutez avec nous en privé
              </p>
            </div>
          </a>

          <a
            href="mailto:contact@vivrebio.com"
            className="flex items-center gap-3 rounded-xl border border-sable p-3.5 transition hover:border-vivrebio-vert"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-vert-pale text-vivrebio-vert">
              <FaEnvelope size={15} />
            </span>

            <div>
              <p className="text-sm font-medium text-encre">
                E-mail
              </p>
              <p className="text-xs text-encre/50">
                contact@vivrebio.com
              </p>
            </div>
          </a>

          <a
            href="https://facebook.com/vivrebio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-sable p-3.5 transition hover:border-vivrebio-vert"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-vert-pale text-vivrebio-vert">
              <FaFacebook size={15} />
            </span>

            <div>
              <p className="text-sm font-medium text-encre">
                Facebook
              </p>
              <p className="text-xs text-encre/50">
                @vivrebio
              </p>
            </div>
          </a>

          <a
            href="https://instagram.com/vivrebio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-sable p-3.5 transition hover:border-vivrebio-vert"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-vert-pale text-vivrebio-vert">
              <FaInstagram size={15} />
            </span>

            <div>
              <p className="text-sm font-medium text-encre">
                Instagram
              </p>
              <p className="text-xs text-encre/50">
                @vivrebio
              </p>
            </div>
          </a>

          <a
            href="https://tiktok.com/@vivrebio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-sable p-3.5 transition hover:border-vivrebio-vert"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-vert-pale text-vivrebio-vert">
              <FaTiktok size={15} />
            </span>

            <div>
              <p className="text-sm font-medium text-encre">
                TikTok
              </p>
              <p className="text-xs text-encre/50">
                @vivrebio
              </p>
            </div>
          </a>

          <a
            href="https://chat.whatsapp.com/votre-lien-de-groupe"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-sable p-3.5 transition hover:border-vivrebio-vert"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-vert-pale text-vivrebio-vert">
              <FaWhatsapp size={15} />
            </span>

            <div>
              <p className="text-sm font-medium text-encre">
                Groupe WhatsApp
              </p>
              <p className="text-xs text-encre/50">
                Échangez avec la communauté Vivre Bio
              </p>
            </div>
          </a>

          <a
            href="https://whatsapp.com/channel/votre-lien-de-chaine"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-sable p-3.5 transition hover:border-vivrebio-vert"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-vert-pale text-vivrebio-vert">
              <FaWhatsapp size={15} />
            </span>

            <div>
              <p className="text-sm font-medium text-encre">
                Chaîne WhatsApp
              </p>
              <p className="text-xs text-encre/50">
                Recevez nos actualités et promotions
              </p>
            </div>
          </a>
        </div>
      </div>
    </main>
  );
}