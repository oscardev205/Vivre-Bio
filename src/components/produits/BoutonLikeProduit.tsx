// src/components/produits/BoutonLikeProduit.tsx
// Cœur "J'aime ce produit" — état initial chargé au montage, bascule au clic.
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FaHeart, FaRegHeart } from "react-icons/fa6";

export function BoutonLikeProduit({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(false);
  const [total, setTotal] = useState(0);
  const [chargement, setChargement] = useState(false);

  useEffect(() => {
    fetch(`/api/produits/${productId}/like`)
      .then((res) => res.json())
      .then((data) => {
        setLiked(data.likeParUtilisateur);
        setTotal(data.total);
      });
  }, [productId]);

  async function basculer() {
    if (!session) {
      window.location.href = "/connexion";
      return;
    }
    setChargement(true);
    const res = await fetch(`/api/produits/${productId}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
      setTotal(data.total);
    }
    setChargement(false);
  }

  return (
    <button
      onClick={basculer}
      disabled={chargement}
      className="flex items-center gap-1.5 rounded-full border border-sable px-3 py-1.5 text-xs font-medium text-encre/70 transition hover:border-vivrebio-rouge"
    >
      {liked ? <FaHeart className="text-vivrebio-rouge" size={13} /> : <FaRegHeart size={13} />}
      {total > 0 ? total : "J'aime"}
    </button>
  );
}