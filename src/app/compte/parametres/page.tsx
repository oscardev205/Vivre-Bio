// src/app/compte/parametres/page.tsx
// Deux formulaires distincts : infos personnelles, et changement de mot de passe.
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { PasswordChecklist } from "@/components/ui/PasswordChecklist";

export default function ParametresPage() {
  const { data: session, update } = useSession();

  const [nom, setNom] = useState(session?.user?.name ?? "");
  const [telephone, setTelephone] = useState("");
  const [chargementProfil, setChargementProfil] = useState(false);
  const [messageProfil, setMessageProfil] = useState("");
  const [erreurProfil, setErreurProfil] = useState("");

  const [ancienMdp, setAncienMdp] = useState("");
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [confirmationMdp, setConfirmationMdp] = useState("");
  const [chargementMdp, setChargementMdp] = useState(false);
  const [messageMdp, setMessageMdp] = useState("");
  const [erreurMdp, setErreurMdp] = useState("");

  async function handleProfil(e: React.FormEvent) {
    e.preventDefault();
    setChargementProfil(true);
    setErreurProfil("");
    setMessageProfil("");

    const res = await fetch("/api/compte/profil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom, telephone }),
    });
    const data = await res.json();
    setChargementProfil(false);

    if (!res.ok) {
      setErreurProfil(data.erreur || "Une erreur est survenue.");
      return;
    }

    setMessageProfil("Informations mises à jour.");
    await update({ name: nom });
  }

  async function handleMotDePasse(e: React.FormEvent) {
    e.preventDefault();
    setErreurMdp("");
    setMessageMdp("");

    if (nouveauMdp !== confirmationMdp) {
      setErreurMdp("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setChargementMdp(true);
    const res = await fetch("/api/compte/mot-de-passe", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ancienMotDePasse: ancienMdp, nouveauMotDePasse: nouveauMdp }),
    });
    const data = await res.json();
    setChargementMdp(false);

    if (!res.ok) {
      setErreurMdp(data.erreur || "Une erreur est survenue.");
      return;
    }

    setMessageMdp("Mot de passe modifié avec succès.");
    setAncienMdp("");
    setNouveauMdp("");
    setConfirmationMdp("");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="carte-3d p-5">
        <p className="mb-4 text-sm font-medium text-encre">Informations personnelles</p>
        <form onSubmit={handleProfil} className="flex flex-col gap-3">
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Nom complet"
            required
            className="rounded-lg border border-sable px-3 py-2.5 text-sm"
          />
          <input
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="Téléphone"
            className="rounded-lg border border-sable px-3 py-2.5 text-sm"
          />
          <input
            value={session?.user?.email ?? ""}
            disabled
            className="rounded-lg border border-sable bg-sable/20 px-3 py-2.5 text-sm text-encre/40"
          />
          <p className="text-[11px] text-encre/40">L&apos;e-mail ne peut pas être modifié pour l&apos;instant.</p>

          {erreurProfil && <p className="text-xs text-vivrebio-rouge">{erreurProfil}</p>}
          {messageProfil && <p className="text-xs text-vivrebio-vert">{messageProfil}</p>}

          <Button type="submit" disabled={chargementProfil} className="w-fit">
            {chargementProfil ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </form>
      </div>

      <div className="carte-3d p-5">
        <p className="mb-4 text-sm font-medium text-encre">Changer de mot de passe</p>
        <form onSubmit={handleMotDePasse} className="flex flex-col gap-3">
          <input
            type="password"
            value={ancienMdp}
            onChange={(e) => setAncienMdp(e.target.value)}
            placeholder="Mot de passe actuel"
            required
            className="rounded-lg border border-sable px-3 py-2.5 text-sm"
          />
          <input type="password" value={nouveauMdp} onChange={(e) => setNouveauMdp(e.target.value)} placeholder="Nouveau mot de passe (8 car. min., lettre + chiffre)" required minLength={8} className="rounded-lg border border-sable px-3 py-2.5 text-sm" />
          <PasswordChecklist motDePasse={nouveauMdp} />
          <input
            type="password"
            value={confirmationMdp}
            onChange={(e) => setConfirmationMdp(e.target.value)}
            placeholder="Confirmer le nouveau mot de passe"
            required
            minLength={6}
            className="rounded-lg border border-sable px-3 py-2.5 text-sm"
          />

          {erreurMdp && <p className="text-xs text-vivrebio-rouge">{erreurMdp}</p>}
          {messageMdp && <p className="text-xs text-vivrebio-vert">{messageMdp}</p>}

          <Button type="submit" disabled={chargementMdp} className="w-fit">
            {chargementMdp ? "Modification..." : "Modifier le mot de passe"}
          </Button>
        </form>
      </div>
    </div>
  );
}