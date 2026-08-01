// src/app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { TraitFeuille } from "@/components/ui/TraitFeuille";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) return { title: "Article introuvable" };
  return { title: post.titre, description: post.extrait };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || !post.publie) notFound();

  const paragraphes = post.contenu.split(/\n\s*\n/).filter(Boolean);

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-xs text-encre/40">{new Date(post.createdAt).toLocaleDateString("fr-FR")} · {post.auteur}</p>
      <h1 className="mt-2 text-2xl font-bold text-encre">{post.titre}</h1>
      <TraitFeuille className="mt-2" />

      <div className="mt-6 space-y-4 text-sm leading-relaxed text-encre/70">
        {paragraphes.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </main>
  );
}