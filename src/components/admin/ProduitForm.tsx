// src/components/admin/ProduitForm.tsx
// Fichier complet : la zone d'upload devient une vraie carte cliquable stylée
// (bouton visible, aperçu plus grand et mieux intégré), au lieu du champ
// <input type="file"> brut du navigateur.
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X } from "lucide-react";
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
  imageUrl?: string | null;
};

export function ProduitForm({ categories, valeursInitiales }: { categories: Categorie[]; valeursInitiales?: ProduitValeurs }) {
  const router = useRouter();
  const inputFichierRef = useRef<HTMLInputElement>(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [imageUrl, setImageUrl] = useState(valeursInitiales?.imageUrl ?? "");
  const [chargementImage, setChargementImage] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;

    setChargementImage(true);
    setErreur("");

    const formData = new FormData();
    formData.append("fichier", fichier);

    const res = await fetch("/api/admin/produits/upload-image", { method: "POST", body: formData });

    let data: { erreur?: string; url?: string } = {};
    try {
      data = await res.json();
    } catch {}

    setChargementImage(false);

    if (!res.ok) {
      setErreur(data.erreur || "Échec de l'upload de l'image.");
      return;
    }

    setImageUrl(data.url ?? "");
  }

  function retirerImage() {
    setImageUrl("");
    if (inputFichierRef.current) inputFichierRef.current.value = "";
  }

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
      imageUrl: imageUrl || null,
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
        <label className="mb-1.5 block text-xs font-medium text-encre">Photo du produit</label>

        <div className="flex items-start gap-4">
          {imageUrl && !chargementImage && (
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-sable bg-vert-pale">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Aperçu" className="h-full w-full object-contain p-1" />
              <button
                type="button"
                onClick={retirerImage}
                aria-label="Retirer la photo"
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-vivrebio-rouge text-white"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <div className="flex-1">
            <input ref={inputFichierRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" id="upload-photo" />
            <label
              htmlFor="upload-photo"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-sable px-4 py-6 text-center text-sm text-encre/60 transition hover:border-vivrebio-vert hover:text-vivrebio-vert"
            >
              <ImagePlus size={18} />
              {chargementImage ? "Envoi en cours..." : imageUrl ? "Changer la photo" : "Choisir une photo"}
            </label>
            <p className="mt-1.5 text-[11px] text-encre/40">
              JPG, PNG ou WebP — 5 Mo maximum. Laisse vide pour garder le placeholder actuel.
            </p>
          </div>
        </div>
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

      <Button type="submit" disabled={chargement || chargementImage}>
        {chargement ? "Enregistrement..." : valeursInitiales?.id ? "Enregistrer les modifications" : "Créer le produit"}
      </Button>
    </form>
  );
}