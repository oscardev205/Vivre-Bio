// src/app/admin/blog/[id]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostForm } from "@/components/admin/PostForm";

export default async function EditerArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div>
      <p className="mb-4 text-sm font-medium text-encre">Modifier « {post.titre} »</p>
      <PostForm valeursInitiales={{ id: post.id, titre: post.titre, extrait: post.extrait, contenu: post.contenu, publie: post.publie }} />
    </div>
  );
}