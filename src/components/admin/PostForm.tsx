// src/components/admin/PostForm.tsx
// Formulaire partagé création/édition d'article. Le contenu est un simple
// textarea — chaque ligne vide sépare un paragraphe à l'affichage public.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type PostValeurs = {
  id?: string;
  titre: string;
  extrait: string;
  contenu: string;
  publie: boolean;
};

export function PostForm({ valeursInitiales }: { valeursInitiales?: PostValeurs }) {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChargement(true);
    setErreur("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      titre: formData.get("titre"),
      extrait: formData.get("extrait"),
      contenu: formData.get("contenu"),
      publie: formData.get("publie") === "on",
    };

    const url = valeursInitiales?.id ? `/api/admin/blog/${valeursInitiales.id}` : "/api/admin/blog";
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

    router.push("/admin/blog");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="carte-3d flex flex-col gap-3 p-6">
      <input name="titre" placeholder="Titre de l'article" defaultValue={valeursInitiales?.titre} required className="rounded-lg border border-sable px-3 py-2.5 text-sm" />
      <textarea name="extrait" placeholder="Extrait (résumé court, affiché dans la liste)" defaultValue={valeursInitiales?.extrait} required rows={2} className="rounded-lg border border-sable px-3 py-2.5 text-sm" />
      <textarea name="contenu" placeholder="Contenu complet (séparez les paragraphes par une ligne vide)" defaultValue={valeursInitiales?.contenu} required rows={10} className="rounded-lg border border-sable px-3 py-2.5 text-sm" />

      <label className="flex items-center gap-2 text-sm text-encre">
        <input type="checkbox" name="publie" defaultChecked={valeursInitiales?.publie ?? false} />
        Publier immédiatement (visible sur le site)
      </label>

      {erreur && <p className="text-xs text-vivrebio-rouge">{erreur}</p>}

      <Button type="submit" disabled={chargement}>
        {chargement ? "Enregistrement..." : valeursInitiales?.id ? "Enregistrer les modifications" : "Créer l'article"}
      </Button>
    </form>
  );
}