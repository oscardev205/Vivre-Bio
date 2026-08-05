// src/app/panier/page.tsx
// Fichier complet : la section points ne s'affiche que si le programme est
// actif ET que le client a un solde > 0 — vérifié via /api/fidelite qui
// inclut désormais ce statut.
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { formatPrix } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Trash2, X } from "lucide-react";

export default function PanierPage() {
  const { data: session } = useSession();
  const { items, modifierQuantite, retirerDuPanier, sousTotal, promo, appliquerPromo, retirerPromo, pointsUtilises, definirPointsUtilises } = useCart();
  const [codeSaisi, setCodeSaisi] = useState("");
  const [chargementPromo, setChargementPromo] = useState(false);
  const [erreurPromo, setErreurPromo] = useState("");
  const [soldePoints, setSoldePoints] = useState(0);
  const [fideliteActive, setFideliteActive] = useState(false);
  const [valeurPoint, setValeurPoint] = useState(5);
  const [pointsSaisis, setPointsSaisis] = useState(pointsUtilises || "");

  useEffect(() => {
    if (session) {
      fetch("/api/fidelite")
        .then((res) => res.json())
        .then((data) => {
          setSoldePoints(data.points ?? 0);
          setFideliteActive(data.fideliteActive ?? false);
          setValeurPoint(data.valeurPoint ?? 5);
        })
        .catch(() => {
          setSoldePoints(0);
          setFideliteActive(false);
          setValeurPoint(5);
        });
    }
  }, [session]);

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-encre/50">Votre panier est vide.</p>
        <Link href="/boutique"><Button className="mt-4">Découvrir la boutique</Button></Link>
      </main>
    );
  }

  async function handleAppliquerPromo() {
    if (!codeSaisi.trim()) return;
    setChargementPromo(true);
    setErreurPromo("");
    const res = await fetch("/api/promo/valider", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: codeSaisi, sousTotal }),
    });
    const data = await res.json();
    setChargementPromo(false);
    if (!res.ok) { setErreurPromo(data.erreur || "Code invalide"); return; }
    appliquerPromo({ code: data.code, reduction: data.reduction });
    setCodeSaisi("");
  }

  function appliquerPoints() {
    const points = Math.max(0, Math.min(Number(pointsSaisis) || 0, soldePoints));
    definirPointsUtilises(points);
  }

  const reductionPromo = promo?.reduction ?? 0;
  const reductionPoints = fideliteActive ? pointsUtilises * valeurPoint : 0;
  const sousTotalApresReduction = Math.max(0, sousTotal - reductionPromo - reductionPoints);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold text-vivrebio-vert">
        Mon panier ({items.length} article{items.length > 1 ? "s" : ""})
      </h1>

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="flex-1 divide-y divide-sable">
          {items.map((item) => (
            <div key={item.productId} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-encre">{item.nom}</p>
                <p className="text-xs text-encre/40">{formatPrix(item.prix)} / unité</p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-normal">
                <div className="flex items-center rounded-lg border border-sable">
                  <button className="px-2.5 py-1 text-sm text-encre" onClick={() => modifierQuantite(item.productId, item.quantite - 1)}>−</button>
                  <span className="border-x border-sable px-3 py-1 text-sm text-encre">{item.quantite}</span>
                  <button className="px-2.5 py-1 text-sm text-encre" onClick={() => modifierQuantite(item.productId, item.quantite + 1)} disabled={item.quantite >= item.stock}>+</button>
                </div>
                <p className="w-20 text-right text-sm font-medium text-encre">{formatPrix(item.prix * item.quantite)}</p>
                <button onClick={() => retirerDuPanier(item.productId)} aria-label="Retirer l'article"><Trash2 size={16} className="text-encre/30 hover:text-vivrebio-rouge" /></button>
              </div>
            </div>
          ))}
        </div>

        <aside className="w-full rounded-xl bg-vert-pale p-5 md:w-64 md:shrink-0">
          <p className="mb-3 text-sm font-medium text-encre">Résumé</p>

          {promo ? (
            <div className="mb-3 flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs dark:bg-[#1c2921]">
              <span className="font-medium text-vivrebio-vert">Code {promo.code} appliqué</span>
              <button onClick={retirerPromo} aria-label="Retirer le code promo"><X size={14} className="text-encre/40" /></button>
            </div>
          ) : (
            <div className="mb-3">
              <div className="flex gap-1.5">
                <input value={codeSaisi} onChange={(e) => setCodeSaisi(e.target.value.toUpperCase())} placeholder="Code promo" className="flex-1 rounded-lg border border-sable-fonce bg-white px-2.5 py-1.5 text-xs text-encre dark:bg-[#1c2921]" />
                <button onClick={handleAppliquerPromo} disabled={chargementPromo} className="rounded-lg bg-vivrebio-vert px-3 text-xs font-medium text-white">{chargementPromo ? "..." : "OK"}</button>
              </div>
              {erreurPromo && <p className="mt-1 text-[11px] text-vivrebio-rouge">{erreurPromo}</p>}
            </div>
          )}

          {/* La section points n'apparaît QUE si le programme est actif ET que le client a un solde */}
          {fideliteActive && session && soldePoints > 0 && (
            <div className="mb-3 rounded-lg bg-white px-3 py-2.5 text-xs dark:bg-[#1c2921]">
              <p className="mb-1.5 font-medium text-encre">
                Vous avez <strong className="text-vivrebio-vert">{soldePoints} points</strong> ({formatPrix(soldePoints * valeurPoint)} de réduction)
              </p>
              {pointsUtilises > 0 ? (
                <div className="flex items-center justify-between">
                  <span className="text-vivrebio-vert">{pointsUtilises} points utilisés</span>
                  <button onClick={() => { definirPointsUtilises(0); setPointsSaisis(""); }} aria-label="Retirer les points">
                    <X size={13} className="text-encre/40" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    value={pointsSaisis}
                    onChange={(e) => setPointsSaisis(e.target.value)}
                    max={soldePoints}
                    placeholder="Points à utiliser"
                    className="flex-1 rounded-lg border border-sable-fonce px-2.5 py-1.5 text-xs text-encre"
                  />
                  <button onClick={appliquerPoints} className="rounded-lg bg-vivrebio-vert px-3 text-xs font-medium text-white">OK</button>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between text-xs text-encre/60">
            <span>Sous-total</span>
            <span>{formatPrix(sousTotal)}</span>
          </div>
          {reductionPromo > 0 && (
            <div className="mt-1.5 flex justify-between text-xs text-vivrebio-vert">
              <span>Réduction (code)</span>
              <span>− {formatPrix(reductionPromo)}</span>
            </div>
          )}
          {reductionPoints > 0 && (
            <div className="mt-1.5 flex justify-between text-xs text-vivrebio-vert">
              <span>Réduction (points)</span>
              <span>− {formatPrix(reductionPoints)}</span>
            </div>
          )}

          <div className="mt-3 flex justify-between border-t border-sable-fonce pt-3 text-sm font-semibold text-encre">
            <span>Total</span>
            <span className="text-vivrebio-vert">{formatPrix(sousTotalApresReduction)}</span>
          </div>
          <p className="mt-1.5 text-[10px] text-encre/40">Livraison ou retrait à choisir à l&apos;étape suivante.</p>

          <Link href="/commande"><Button className="mt-4 w-full">Passer la commande</Button></Link>
        </aside>
      </div>
    </main>
  );
}