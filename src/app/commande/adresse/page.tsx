// src/app/commande/adresse/page.tsx
// Fichier complet : ajout de pointsUtilises (récupéré via useCart, transmis
// dans les trois cas de soumission : adresse existante, nouvelle adresse, retrait),
// en plus de tout ce qui existait déjà (choix retrait/livraison, demande de zone
// pré-remplie au clic, vérification de couverture en direct).
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { AddressForm, AdresseData } from "@/components/commande/AddressForm";
import { ModeLivraisonChoix } from "@/components/commande/ModeLivraisonChoix";
import { RetraitForm } from "@/components/commande/RetraitForm";
import { Star } from "lucide-react";

type AdresseEnregistree = AdresseData & { id: string; parDefaut: boolean };
type InfoFrais = { frais: number; delaiEstime: string | null; zoneTrouvee: boolean };

export default function CommandeAdressePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, viderPanier, promo, pointsUtilises } = useCart();
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [mode, setMode] = useState<"LIVRAISON" | "RETRAIT">("LIVRAISON");

  const [adressesEnregistrees, setAdressesEnregistrees] = useState<AdresseEnregistree[]>([]);
  const [chargementAdresses, setChargementAdresses] = useState(true);
  const [adresseSelectionnee, setAdresseSelectionnee] = useState<string | null>(null);
  const [nouvelleAdresse, setNouvelleAdresse] = useState(false);

  const [infoFrais, setInfoFrais] = useState<InfoFrais | null>(null);
  const [afficherDemande, setAfficherDemande] = useState(false);
  const [demandeEnvoyee, setDemandeEnvoyee] = useState(false);
  const [nomDemande, setNomDemande] = useState("");
  const [telephoneDemande, setTelephoneDemande] = useState("");
  const [emailDemande, setEmailDemande] = useState("");

  useEffect(() => {
    fetch("/api/adresses")
      .then((res) => res.json())
      .then((data: AdresseEnregistree[]) => {
        setAdressesEnregistrees(data);
        const parDefaut = data.find((a) => a.parDefaut);
        if (parDefaut) setAdresseSelectionnee(parDefaut.id);
        else if (data.length === 0) setNouvelleAdresse(true);
      })
      .finally(() => setChargementAdresses(false));
  }, []);

  useEffect(() => {
    const adresse = adressesEnregistrees.find((a) => a.id === adresseSelectionnee);
    if (!adresse) {
      setInfoFrais(null);
      return;
    }
    setDemandeEnvoyee(false);
    setAfficherDemande(false);

    fetch(`/api/livraison/frais?ville=${encodeURIComponent(adresse.ville)}`)
      .then((res) => res.json())
      .then(setInfoFrais)
      .catch(() => setInfoFrais(null));
  }, [adresseSelectionnee, adressesEnregistrees]);

  function ouvrirDemande() {
    if (!afficherDemande) {
      const adresse = adressesEnregistrees.find((a) => a.id === adresseSelectionnee);
      setNomDemande(adresse?.nomComplet ?? "");
      setTelephoneDemande(adresse?.telephone ?? "");
      setEmailDemande(session?.user?.email ?? "");
    }
    setAfficherDemande((v) => !v);
  }

  async function handleEnvoyerDemande(e: React.FormEvent) {
    e.preventDefault();
    const adresse = adressesEnregistrees.find((a) => a.id === adresseSelectionnee);
    if (!adresse) return;
    await fetch("/api/livraison/demande", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ville: adresse.ville, nom: nomDemande, telephone: telephoneDemande, email: emailDemande }),
    });
    setDemandeEnvoyee(true);
  }

  async function envoyerCommande(body: object) {
    setChargement(true);
    setErreur("");
    const res = await fetch("/api/commandes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, modePaiement: "mobile_money", codePromo: promo?.code, pointsUtilises }),
    });
    let data: { erreur?: string; numero?: string } = {};
    try {
      data = await res.json();
    } catch {}
    setChargement(false);
    if (!res.ok) {
      setErreur(data.erreur || "Une erreur est survenue, réessaie dans un instant.");
      return;
    }
    viderPanier();
    router.push(`/commande/paiement/${data.numero}`);
  }

  function handleUtiliserAdresseExistante() {
    if (!adresseSelectionnee) return;
    envoyerCommande({
      items: items.map((i) => ({ productId: i.productId, quantite: i.quantite })),
      addressId: adresseSelectionnee,
      modeLivraison: "LIVRAISON",
    });
  }

  function handleNouvelleAdresse(adresse: AdresseData) {
    envoyerCommande({
      items: items.map((i) => ({ productId: i.productId, quantite: i.quantite })),
      adresse,
      modeLivraison: "LIVRAISON",
    });
  }

  function handleRetraitValide(contact: { nomComplet: string; telephone: string }) {
    envoyerCommande({
      items: items.map((i) => ({ productId: i.productId, quantite: i.quantite })),
      modeLivraison: "RETRAIT",
      contactNom: contact.nomComplet,
      contactTelephone: contact.telephone,
    });
  }

  if (!session) {
    return <p className="mx-auto max-w-md px-4 py-16 text-center text-encre/50">Veuillez vous connecter.</p>;
  }
  if (items.length === 0) {
    return <p className="mx-auto max-w-md px-4 py-16 text-center text-encre/50">Votre panier est vide.</p>;
  }

  const telephoneSession = (session.user as { telephone?: string | null })?.telephone ?? "";
  const zoneNonCouverte = infoFrais !== null && !infoFrais.zoneTrouvee;

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <p className="mb-6 text-xs text-encre/40">1. Panier → 2. Identification → 3. Livraison → 4. Paiement</p>
      <h1 className="mb-6 text-lg font-semibold text-vivrebio-vert">Livraison</h1>

      <ModeLivraisonChoix mode={mode} onChange={setMode} />

      {mode === "RETRAIT" ? (
        <RetraitForm
          onSubmit={handleRetraitValide}
          chargement={chargement}
          valeurNomInitiale={session.user?.name ?? ""}
          valeurTelephoneInitiale={telephoneSession}
        />
      ) : chargementAdresses ? (
        <p className="text-sm text-encre/40">Chargement de vos adresses...</p>
      ) : adressesEnregistrees.length > 0 && !nouvelleAdresse ? (
        <div className="carte-3d p-5">
          <p className="mb-3 text-sm font-medium text-encre">Choisissez une adresse enregistrée</p>
          <div className="flex flex-col gap-2">
            {adressesEnregistrees.map((adresse) => (
              <label
                key={adresse.id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                  adresseSelectionnee === adresse.id ? "border-vivrebio-vert bg-vert-pale" : "border-sable"
                }`}
              >
                <input
                  type="radio"
                  name="adresse"
                  checked={adresseSelectionnee === adresse.id}
                  onChange={() => setAdresseSelectionnee(adresse.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-encre">{adresse.nomComplet}</p>
                    {adresse.parDefaut && (
                      <span className="flex items-center gap-1 text-xs text-vivrebio-vert">
                        <Star size={11} fill="currentColor" /> Par défaut
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-encre/50">{adresse.adresseDetail}, {adresse.quartier}</p>
                  <p className="text-xs text-encre/50">{adresse.ville} · {adresse.telephone}</p>
                </div>
              </label>
            ))}
          </div>

          {infoFrais && (
            <div className={`mt-3 rounded-lg px-3 py-2.5 text-xs ${infoFrais.zoneTrouvee ? "bg-vert-pale text-encre" : "bg-vivrebio-rouge/10 text-encre"}`}>
              {infoFrais.zoneTrouvee ? (
                <p>
                  🚚 Livraison : <strong>{infoFrais.frais.toLocaleString("fr-FR")} FCFA</strong>
                  {infoFrais.delaiEstime ? ` · ${infoFrais.delaiEstime}` : ""}
                </p>
              ) : (
                <div>
                  <p className="font-medium text-vivrebio-rouge">
                    Nous ne livrons pas encore à {adressesEnregistrees.find((a) => a.id === adresseSelectionnee)?.ville}.
                  </p>
                  <p className="mt-1">Choisissez le retrait en boutique, ou demandez la couverture de cette zone.</p>
                  {!demandeEnvoyee ? (
                    <button type="button" onClick={ouvrirDemande} className="mt-1.5 font-medium text-vivrebio-vert hover:underline">
                      {afficherDemande ? "Annuler" : "Demander la livraison ici →"}
                    </button>
                  ) : (
                    <p className="mt-1.5 font-medium text-vivrebio-vert">Demande envoyée — vous serez notifié(e) par e-mail.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {afficherDemande && !demandeEnvoyee && (
            <div className="mt-3 rounded-lg border border-sable p-3">
              <p className="mb-2 text-xs font-medium text-encre">Vos coordonnées pour être prévenu(e)</p>
              <div className="flex flex-col gap-2">
                <input
                  value={nomDemande}
                  onChange={(e) => setNomDemande(e.target.value)}
                  placeholder="Nom"
                  required
                  className="rounded-lg border border-sable px-3 py-2 text-sm"
                />
                <input
                  value={telephoneDemande}
                  onChange={(e) => setTelephoneDemande(e.target.value)}
                  placeholder="Téléphone"
                  required
                  className="rounded-lg border border-sable px-3 py-2 text-sm"
                />
                <input
                  value={emailDemande}
                  onChange={(e) => setEmailDemande(e.target.value)}
                  type="email"
                  placeholder="E-mail (pour la notification)"
                  required
                  className="rounded-lg border border-sable px-3 py-2 text-sm"
                />
                <button type="button" onClick={handleEnvoyerDemande} className="rounded-lg bg-vivrebio-vert px-4 py-2 text-xs font-medium text-white">
                  Envoyer la demande
                </button>
              </div>
            </div>
          )}

          {erreur && <p className="mt-3 text-xs text-vivrebio-rouge">{erreur}</p>}

          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={handleUtiliserAdresseExistante}
              disabled={!adresseSelectionnee || chargement || zoneNonCouverte}
              className="rounded-lg bg-vivrebio-vert px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {chargement ? "Enregistrement..." : zoneNonCouverte ? "Zone non disponible" : "Continuer vers le paiement"}
            </button>
            <button onClick={() => setNouvelleAdresse(true)} className="text-xs text-vivrebio-vert hover:underline">
              Utiliser une nouvelle adresse
            </button>
          </div>
        </div>
      ) : (
        <>
          {adressesEnregistrees.length > 0 && (
            <button onClick={() => setNouvelleAdresse(false)} className="mb-3 text-xs text-vivrebio-vert hover:underline">
              ← Revenir à mes adresses enregistrées
            </button>
          )}
          <AddressForm
            onSubmit={handleNouvelleAdresse}
            chargement={chargement}
            valeursInitiales={{ nomComplet: session.user?.name ?? "", telephone: telephoneSession }}
            emailInitial={session.user?.email ?? ""}
          />
          {erreur && <p className="mt-3 text-xs text-vivrebio-rouge">{erreur}</p>}
        </>
      )}
    </main>
  );
}