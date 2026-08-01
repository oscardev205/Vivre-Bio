// src/app/blog/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { TraitFeuille } from "@/components/ui/TraitFeuille";
import { FadeIn } from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Blog",
  description: "Conseils, bienfaits et actualités autour des produits naturels Vivre Bio.",
};

export default async function BlogPage() {
  const posts = await prisma.post.findMany({ where: { publie: true }, orderBy: { createdAt: "desc" } });

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-vivrebio-rouge">Notre blog</p>
      <h1 className="mt-1 text-2xl font-bold text-encre">Conseils &amp; actualités</h1>
      <TraitFeuille className="mt-2" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {posts.map((post, i) => (
          <FadeIn key={post.id} delai={i * 80}>
            <Link href={`/blog/${post.slug}`} className="carte-3d block p-5 transition hover:-translate-y-0.5">
              <p className="text-xs text-encre/40">{new Date(post.createdAt).toLocaleDateString("fr-FR")}</p>
              <p className="mt-1 text-base font-semibold text-encre">{post.titre}</p>
              <p className="mt-2 text-sm text-encre/60 line-clamp-3">{post.extrait}</p>
              <p className="mt-3 text-xs font-medium text-vivrebio-vert">Lire l&apos;article →</p>
            </Link>
          </FadeIn>
        ))}
        {posts.length === 0 && <p className="text-sm text-encre/40">Aucun article pour l&apos;instant.</p>}
      </div>
    </main>
  );
}