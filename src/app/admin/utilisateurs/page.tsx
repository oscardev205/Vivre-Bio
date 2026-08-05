// src/app/admin/utilisateurs/page.tsx
// Fichier complet : try/catch + finally sur handleCreation, pour que le bouton
// ne reste JAMAIS bloqué sur "Création..." même en cas d'erreur réseau ou de
// réponse non-JSON — le chargement se réinitialise toujours.
"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type Utilisateur = {
  id: string; nom: string | null; email: string | null; telephone: string | null;
  role: "CLIENT" | "ADMIN" | "LIVREUR"; actif: boolean; disponible: boolean; createdAt: string;
};

export default function AdminUtilisateursPage() {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [filtreRole, setFiltreRole] = useState("");
  const [afficherForm, setAfficherForm] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");

  async function charger() {
    const res = await fetch(`/api/admin/utilisateurs${filtreRole ? `?role=${filtreRole}` : ""}`);
    if (res.ok) setUtilisateurs(await res.json());
  }

  useEffect(() => { charger(); }, [filtreRole]);

  async function handleCreation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChargement(true);
    setErreur("");
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/admin/utilisateurs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: formData.get("nom"),
          email: formData.get("email"),
          telephone: formData.get("telephone"),
          role: formData.get("role"),
        }),
      });

      let data: { erreur?: string; email?: string } = {};
      try {
        data = await res.json();
      } catch {
        // Réponse sans corps JSON valide — on affiche un message générique
      }

      if (!res.ok) {
        setErreur(data.erreur || "Une erreur est survenue.");
        return;
      }

      setMessage(`Compte créé — un e-mail a été envoyé à ${data.email} pour définir son mot de passe.`);
      setAfficherForm(false);
      form.reset();
      await charger();
      setTimeout(() => setMessage(""), 6000);
    } catch (err) {
      console.error(err);
      setErreur("Impossible de contacter le serveur, réessaie dans un instant.");
    } finally {
      setChargement(false);
    }
  }

  async function changerRole(id: string, role: string) {
    await fetch(`/api/admin/utilisateurs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    await charger();
  }

  async function basculerActif(u: Utilisateur) {
    await fetch(`/api/admin/utilisateurs/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actif: !u.actif }),
    });
    await charger();
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-encre">{utilisateurs.length} compte(s)</p>
        <button onClick={() => setAfficherForm((v) => !v)} className="text-left text-xs text-vivrebio-vert hover:underline sm:text-right">
          {afficherForm ? "Annuler" : "+ Créer un compte admin/livreur"}
        </button>
      </div>

      {message && <p className="mb-4 rounded-lg bg-vert-pale px-3 py-2 text-xs text-encre">{message}</p>}

      {afficherForm && (
        <form onSubmit={handleCreation} className="carte-3d mb-6 flex flex-col gap-3 p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="nom" placeholder="Nom complet" required className="rounded-lg border border-sable px-3 py-2 text-sm" />
            <input name="email" type="email" placeholder="E-mail" required className="rounded-lg border border-sable px-3 py-2 text-sm" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="telephone" placeholder="Téléphone (optionnel)" className="rounded-lg border border-sable px-3 py-2 text-sm" />
            <select name="role" required className="rounded-lg border border-sable px-3 py-2 text-sm">
              <option value="">Rôle...</option>
              <option value="ADMIN">Admin</option>
              <option value="LIVREUR">Livreur</option>
            </select>
          </div>
          {erreur && <p className="text-xs text-vivrebio-rouge">{erreur}</p>}
          <Button type="submit" disabled={chargement} className="w-full sm:w-fit">
            {chargement ? "Création..." : "Créer le compte"}
          </Button>
        </form>
      )}

      <div className="mb-3 flex flex-wrap gap-2">
        {["", "CLIENT", "ADMIN", "LIVREUR"].map((r) => (
          <button
            key={r}
            onClick={() => setFiltreRole(r)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              filtreRole === r ? "border-vivrebio-vert bg-vivrebio-vert text-white" : "border-sable text-encre/60"
            }`}
          >
            {r || "Tous"}
          </button>
        ))}
      </div>

      <div className="carte-3d divide-y divide-sable">
        {utilisateurs.map((u) => (
          <div key={u.id} className="flex flex-col gap-2 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-medium text-encre">{u.nom ?? "Sans nom"}</p>
              <p className="text-xs text-encre/40">{u.email} · {u.telephone ?? "—"}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Badge variant={u.actif ? "vert" : "gris"}>{u.actif ? "Actif" : "Désactivé"}</Badge>
              <select
                value={u.role}
                onChange={(e) => changerRole(u.id, e.target.value)}
                className="rounded-lg border border-sable px-2 py-1 text-xs"
              >
                <option value="CLIENT">Client</option>
                <option value="ADMIN">Admin</option>
                <option value="LIVREUR">Livreur</option>
              </select>
              <button onClick={() => basculerActif(u)} className="text-xs font-medium text-vivrebio-vert hover:underline">
                {u.actif ? "Désactiver" : "Réactiver"}
              </button>
            </div>
          </div>
        ))}
        {utilisateurs.length === 0 && <p className="p-6 text-center text-sm text-encre/40">Aucun compte trouvé.</p>}
      </div>
    </div>
  );
}