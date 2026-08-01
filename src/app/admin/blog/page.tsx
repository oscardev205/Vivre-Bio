// src/app/admin/blog/page.tsx
// Fichier complet : titre + statut sur une ligne, boutons d'action sur la
// ligne suivante en flex-wrap sur mobile.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

type Post = { id: string; titre: string; publie: boolean; createdAt: string };

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [enCoursBascule, setEnCoursBascule] = useState<string | null>(null);

  async function charger() {
    const res = await fetch("/api/admin/blog");
    if (res.ok) setPosts(await res.json());
  }

  useEffect(() => { charger(); }, []);

  async function supprimer(id: string) {
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    await charger();
  }

  async function basculerPublication(post: Post) {
    setEnCoursBascule(post.id);
    await fetch(`/api/admin/blog/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publie: !post.publie }),
    });
    setEnCoursBascule(null);
    await charger();
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-encre">{posts.length} article(s)</p>
        <Link href="/admin/blog/nouveau" className="rounded-lg bg-vivrebio-vert px-4 py-2 text-center text-sm font-medium text-white">
          + Nouvel article
        </Link>
      </div>

      <div className="carte-3d divide-y divide-sable">
        {posts.map((post) => (
          <div key={post.id} className="flex flex-col gap-2 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate font-medium text-encre">{post.titre}</p>
              <p className="text-xs text-encre/40">{new Date(post.createdAt).toLocaleDateString("fr-FR")}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <Badge variant={post.publie ? "vert" : "gris"}>{post.publie ? "Publié" : "Brouillon"}</Badge>
              <button
                onClick={() => basculerPublication(post)}
                disabled={enCoursBascule === post.id}
                className="text-xs font-medium text-vivrebio-vert hover:underline disabled:opacity-40"
              >
                {enCoursBascule === post.id ? "..." : post.publie ? "Dépublier" : "Publier"}
              </button>
              <Link href={`/admin/blog/${post.id}`} className="text-xs text-vivrebio-vert hover:underline">
                Modifier
              </Link>
              <button onClick={() => supprimer(post.id)} className="text-xs text-vivrebio-rouge hover:underline">
                Supprimer
              </button>
            </div>
          </div>
        ))}
        {posts.length === 0 && <p className="p-6 text-center text-sm text-encre/40">Aucun article pour l&apos;instant.</p>}
      </div>
    </div>
  );
}