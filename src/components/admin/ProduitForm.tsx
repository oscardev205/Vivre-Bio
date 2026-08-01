// src/components/admin/ProduitForm.tsx
// Fichier complet : grid-cols-3 devient sm:grid-cols-3 (empilé en 1 colonne
// sur mobile, 3 colonnes à partir de sm), au lieu d'écraser 3 champs sur une
// largeur de téléphone.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type Categorie = { id: string; nom: string };

type ProduitValeurs = {
  id?: string;
  nom: string;
  description: string;
  prix: number;
  stock: number;
  categoryId: string;
  actif: boolean;
  seuilAlerte?: number | null;
};

export function ProduitForm({ categories, valeursInitiales }: { categories: Categorie[]; valeursInitiales?: ProduitValeurs }) {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChargement(true);
    setErreur("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      nom: formData.get("nom"),
      description: formData.get("description"),
      prix: Number(formData.get("prix")),
      stock: Number(formData.get("stock")),
      categoryId: formData.get("categoryId"),
      actif: formData.get("actif") === "on",
      seuilAlerte: formData.get("seuilAlerte") ? Number(formData.get("seuilAlerte")) : null,
    };

    const url = valeursInitiales?.id ? `/api/admin/produits/${valeursInitiales.id}` : "/api/admin/produits";
    const method = valeursInitiales?.id ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setChargement(false);

    if (!res.ok) {
      const data = await res.json();
      setErreur(data.erreur || "Une erreur est survenue.");
      return;
    }

    router.push("/admin/produits");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="carte-3d flex flex-col gap-3 p-4 sm:p-6">
      <input name="nom" placeholder="Nom du produit" defaultValue={valeursInitiales?.nom} required className="rounded-lg border border-sable px-3 py-2.5 text-sm" />
      <textarea name="description" placeholder="Description" defaultValue={valeursInitiales?.description} required rows={3} className="rounded-lg border border-sable px-3 py-2.5 text-sm" />
      <div className="grid gap-3 sm:grid-cols-3">
        <input name="prix" type="number" placeholder="Prix (FCFA)" defaultValue={valeursInitiales?.prix} required className="rounded-lg border border-sable px-3 py-2.5 text-sm" />
        <input name="stock" type="number" placeholder="Stock" defaultValue={valeursInitiales?.stock} required className="rounded-lg border border-sable px-3 py-2.5 text-sm" />
        <select name="categoryId" defaultValue={valeursInitiales?.categoryId} required className="rounded-lg border border-sable px-3 py-2.5 text-sm">
          <option value="">Catégorie...</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.nom}</option>
          ))}
        </select>
      </div>
      <div>
        <input name="seuilAlerte" type="number" placeholder="Seuil d'alerte stock bas (optionnel)" defaultValue={valeursInitiales?.seuilAlerte ?? ""} className="rounded-lg border border-sable px-3 py-2.5 text-sm" />
        <p className="mt-1 text-[11px] text-encre/40">Tu recevras un e-mail dès que le stock passera sous ce seuil.</p>
      </div>

      <label className="flex items-center gap-2 text-sm text-encre">
        <input type="checkbox" name="actif" defaultChecked={valeursInitiales?.actif ?? true} />
        Produit actif (visible sur la boutique)
      </label>

      {erreur && <p className="text-xs text-vivrebio-rouge">{erreur}</p>}

      <Button type="submit" disabled={chargement}>
        {chargement ? "Enregistrement..." : valeursInitiales?.id ? "Enregistrer les modifications" : "Créer le produit"}
      </Button>
    </form>
  );
}