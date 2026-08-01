// src/components/commande/AddressForm.tsx
// Correction du bug de pré-remplissage tronqué : au lieu d'un useEffect qui se
// figeait sur le premier caractère tapé, les champs de la demande sont copiés
// une seule fois, au clic sur "Demander la livraison ici", avec les valeurs
// complètes et à jour du formulaire principal à ce moment précis.
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { AddressMapPicker } from "@/components/commande/AddressMapPicker";
import { formatPrix } from "@/lib/format";

export type AdresseData = {
  nomComplet: string;
  telephone: string;
  ville: string;
  quartier: string;
  adresseDetail: string;
  instructions?: string;
  latitude?: number;
  longitude?: number;
};

type Props = {
  onSubmit: (adresse: AdresseData) => void;
  chargement?: boolean;
  valeursInitiales?: Partial<AdresseData>;
  libelleBouton?: string;
  emailInitial?: string;
};

type InfoFrais = { frais: number; delaiEstime: string | null; zoneTrouvee: boolean };

export function AddressForm({
  onSubmit,
  chargement,
  valeursInitiales,
  libelleBouton = "Continuer vers le paiement",
  emailInitial = "",
}: Props) {
  const [erreur, setErreur] = useState("");
  const [adresseDetail, setAdresseDetail] = useState(valeursInitiales?.adresseDetail ?? "");
  const [ville, setVille] = useState(valeursInitiales?.ville ?? "");
  const [quartier, setQuartier] = useState(valeursInitiales?.quartier ?? "");
  const [nomComplet, setNomComplet] = useState(valeursInitiales?.nomComplet ?? "");
  const [telephone, setTelephone] = useState(valeursInitiales?.telephone ?? "");
  const [coordonnees, setCoordonnees] = useState<{ latitude?: number; longitude?: number }>({
    latitude: valeursInitiales?.latitude,
    longitude: valeursInitiales?.longitude,
  });

  const [infoFrais, setInfoFrais] = useState<InfoFrais | null>(null);
  const [afficherDemande, setAfficherDemande] = useState(false);
  const [demandeEnvoyee, setDemandeEnvoyee] = useState(false);
  const [nomDemande, setNomDemande] = useState("");
  const [telephoneDemande, setTelephoneDemande] = useState("");
  const [emailDemande, setEmailDemande] = useState("");

  useEffect(() => {
    if (ville.trim().length < 2) {
      setInfoFrais(null);
      return;
    }
    const delai = setTimeout(async () => {
      try {
        const res = await fetch(`/api/livraison/frais?ville=${encodeURIComponent(ville)}`);
        if (res.ok) setInfoFrais(await res.json());
      } catch {
        setInfoFrais(null);
      }
    }, 500);
    return () => clearTimeout(delai);
  }, [ville]);

  // Ouvre le panneau de demande en copiant les valeurs COMPLÈTES actuelles
  // (pas une synchronisation continue qui se figerait sur le premier caractère)
  function ouvrirDemande() {
    if (!afficherDemande) {
      setNomDemande(nomComplet);
      setTelephoneDemande(telephone);
      setEmailDemande(emailInitial);
    }
    setAfficherDemande((v) => !v);
  }

  async function handleEnvoyerDemande(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/livraison/demande", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ville, nom: nomDemande, telephone: telephoneDemande, email: emailDemande }),
    });
    setDemandeEnvoyee(true);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (infoFrais && !infoFrais.zoneTrouvee) {
      setErreur("Cette ville n'est pas encore couverte — envoyez une demande ci-dessus, ou choisissez le retrait en boutique.");
      return;
    }

    if (!nomComplet || !telephone || !ville || !adresseDetail) {
      setErreur("Merci de remplir tous les champs obligatoires, y compris l'adresse via la carte.");
      return;
    }
    setErreur("");
    onSubmit({
      nomComplet,
      telephone,
      ville,
      quartier,
      adresseDetail,
      instructions: undefined,
      latitude: coordonnees.latitude,
      longitude: coordonnees.longitude,
    });
  }

  const zoneNonCouverte = infoFrais !== null && !infoFrais.zoneTrouvee;

  return (
    <div className="carte-3d p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={nomComplet} onChange={(e) => setNomComplet(e.target.value)} placeholder="Nom complet" required className="rounded-lg border border-sable px-3 py-2.5 text-sm" />
          <input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="Téléphone" required className="rounded-lg border border-sable px-3 py-2.5 text-sm" />
        </div>

        <p className="rounded-lg bg-vert-pale px-3 py-2 text-xs text-encre/70">
          💡 Choisissez votre position sur la carte ci-dessous : la ville et le quartier se
          remplissent automatiquement. Vous pouvez ensuite les corriger si besoin.
        </p>

        <div className="rounded-xl border border-sable bg-papier/60 p-3">
          <p className="mb-2 text-xs font-medium text-encre">Position exacte de livraison</p>
          <AddressMapPicker
            onSelect={({ adresseCourte, lat, lng, ville: villeDetectee, quartier: quartierDetecte }) => {
              setAdresseDetail(adresseCourte);
              setCoordonnees({ latitude: lat, longitude: lng });
              if (villeDetectee) setVille(villeDetectee);
              if (quartierDetecte) setQuartier(quartierDetecte);
            }}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <input value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Ville" required className="w-full rounded-lg border border-sable px-3 py-2.5 text-sm" />
            <p className="mt-1 text-[11px] text-encre/40">Pré-rempli via la carte — modifiable</p>
          </div>
          <div>
            <input value={quartier} onChange={(e) => setQuartier(e.target.value)} placeholder="Quartier" className="w-full rounded-lg border border-sable px-3 py-2.5 text-sm" />
            <p className="mt-1 text-[11px] text-encre/40">Pré-rempli via la carte — modifiable</p>
          </div>
        </div>

        <div>
          <input value={adresseDetail} onChange={(e) => setAdresseDetail(e.target.value)} placeholder="Adresse détaillée (rue, repère...)" required className="w-full rounded-lg border border-sable px-3 py-2.5 text-sm" />
          <p className="mt-1 text-[11px] text-encre/40">Pré-rempli via la carte — modifiable</p>
        </div>

        {infoFrais && (
          <div className={`rounded-lg px-3 py-2.5 text-xs ${infoFrais.zoneTrouvee ? "bg-vert-pale text-encre" : "bg-vivrebio-rouge/10 text-encre"}`}>
            {infoFrais.zoneTrouvee ? (
              <p>
                🚚 Livraison à <strong>{ville}</strong> : <strong>{formatPrix(infoFrais.frais)}</strong>
                {infoFrais.delaiEstime ? ` · ${infoFrais.delaiEstime}` : ""}
              </p>
            ) : (
              <div>
                <p className="font-medium text-vivrebio-rouge">Nous ne livrons pas encore à <strong>{ville}</strong>.</p>
                <p className="mt-1">
                  Pour commander malgré tout : choisissez le <strong>retrait en boutique</strong> ci-dessus,
                  ou envoyez une demande pour qu&apos;on ouvre cette zone.
                </p>
                {!demandeEnvoyee ? (
                  <button type="button" onClick={ouvrirDemande} className="mt-1.5 font-medium text-vivrebio-vert hover:underline">
                    {afficherDemande ? "Annuler" : "Demander la livraison ici →"}
                  </button>
                ) : (
                  <p className="mt-1.5 font-medium text-vivrebio-vert">Demande envoyée — vous serez notifié(e) par e-mail dès que ce sera possible.</p>
                )}
              </div>
            )}
          </div>
        )}

        {afficherDemande && !demandeEnvoyee && (
          <div className="rounded-lg border border-sable p-3">
            <p className="mb-2 text-xs font-medium text-encre">Vos coordonnées pour être prévenu(e)</p>
            <div className="flex flex-col gap-2">
              <input value={nomDemande} onChange={(e) => setNomDemande(e.target.value)} placeholder="Nom" required className="rounded-lg border border-sable px-3 py-2 text-sm" />
              <input value={telephoneDemande} onChange={(e) => setTelephoneDemande(e.target.value)} placeholder="Téléphone" required className="rounded-lg border border-sable px-3 py-2 text-sm" />
              <input value={emailDemande} onChange={(e) => setEmailDemande(e.target.value)} type="email" placeholder="E-mail (pour la notification)" required className="rounded-lg border border-sable px-3 py-2 text-sm" />
              <button type="button" onClick={handleEnvoyerDemande} className="rounded-lg bg-vivrebio-vert px-4 py-2 text-xs font-medium text-white">
                Envoyer la demande
              </button>
            </div>
          </div>
        )}

        {erreur && <p className="text-xs text-vivrebio-rouge">{erreur}</p>}

        <Button type="submit" disabled={chargement || zoneNonCouverte}>
          {chargement ? "Enregistrement..." : zoneNonCouverte ? "Zone non disponible" : libelleBouton}
        </Button>
      </form>
    </div>
  );
}