// src/app/admin/blog/nouveau/page.tsx
import { PostForm } from "@/components/admin/PostForm";

export default function NouvelArticlePage() {
  return (
    <div>
      <p className="mb-4 text-sm font-medium text-encre">Nouvel article</p>
      <PostForm />
    </div>
  );
}