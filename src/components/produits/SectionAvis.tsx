// src/components/produits/SectionAvis.tsx
// Liste des avis + formulaire d'ajout (si connecté) + bouton like par avis.
"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { Etoiles } from "@/components/produits/Etoiles";
import { Button } from "@/components/ui/Button";

type Avis = {
  id: string;
  note: number;
  commentaire: string;
  createdAt: string;
  auteur: string;
  nombreLikes: number;
  likeParUtilisateur: boolean;
};

export function SectionAvis({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const [avis, setAvis] = useState<Avis[]>([]);
  const [charge, setCharge] = useState(false);
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  const charger = useCallback(async () => {
    const res = await fetch(`/api/produits/${productId}/avis`);
    if (res.ok) setAvis(await res.json());
    setCharge(true);
  }, [productId]);

  useEffect(() => {
    charger();
  }, [charger]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!commentaire.trim()) return;

    setEnvoi(true);
    setErreur("");
    const res = await fetch(`/api/produits/${productId}/avis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note, commentaire }),
    });
    const data = await res.json();
    setEnvoi(false);

    if (!res.ok) {
      setErreur(data.erreur || "Une erreur est survenue.");
      return;
    }

    setCommentaire("");
    setNote(5);
    await charger();
  }

  async function basculerLike(avisId: string) {
    if (!session) {
      window.location.href = "/connexion";
      return;
    }
    const res = await fetch(`/api/avis/${avisId}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setAvis((prev) =>
        prev.map((a) => (a.id === avisId ? { ...a, likeParUtilisateur: data.liked, nombreLikes: data.total } : a))
      );
    }
  }

  const moyenne = avis.length > 0 ? avis.reduce((s, a) => s + a.note, 0) / avis.length : 0;

  return (
    <div className="mt-10">
      <div className="mb-4 flex items-center gap-3">
        <p className="text-lg font-bold text-encre">Avis clients</p>
        {avis.length > 0 && (
          <span className="flex items-center gap-1.5 text-sm text-encre/60">
            <Etoiles note={Math.round(moyenne)} taille={13} /> {moyenne.toFixed(1)} ({avis.length})
          </span>
        )}
      </div>

      {session ? (
        <form onSubmit={handleSubmit} className="carte-3d mb-6 p-4">
          <p className="mb-2 text-xs font-medium text-encre">Votre note</p>
          <Etoiles note={note} onChange={setNote} taille={20} />
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Votre avis sur ce produit..."
            rows={3}
            className="mt-3 w-full rounded-lg border border-sable px-3 py-2 text-sm"
          />
          {erreur && <p className="mt-2 text-xs text-vivrebio-rouge">{erreur}</p>}
          <Button type="submit" disabled={envoi} className="mt-3">
            {envoi ? "Envoi..." : "Publier mon avis"}
          </Button>
        </form>
      ) : (
        <p className="mb-6 rounded-lg bg-vert-pale px-4 py-3 text-sm text-encre/70">
          <a href="/connexion" className="font-medium text-vivrebio-vert">Connectez-vous</a> pour laisser un avis.
        </p>
      )}

      <div className="space-y-3">
        {charge && avis.length === 0 && (
          <p className="text-sm text-encre/40">Aucun avis pour l&apos;instant — soyez le premier !</p>
        )}
        {avis.map((a) => (
          <div key={a.id} className="carte-3d p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-encre">{a.auteur}</p>
                <Etoiles note={a.note} taille={12} />
              </div>
              <span className="text-xs text-encre/40">
                {new Date(a.createdAt).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <p className="mt-2 text-sm text-encre/70">{a.commentaire}</p>
            <button
              onClick={() => basculerLike(a.id)}
              className="mt-3 flex items-center gap-1.5 text-xs text-encre/50 hover:text-vivrebio-rouge"
            >
              {a.likeParUtilisateur ? <FaHeart className="text-vivrebio-rouge" size={12} /> : <FaRegHeart size={12} />}
              {a.nombreLikes > 0 ? a.nombreLikes : "Utile"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}