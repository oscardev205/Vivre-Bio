// src/app/admin/layout.tsx
// Fichier complet : utilise désormais <AdminNav />.

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;

  if (!session) redirect("/connexion");
  if (role !== "ADMIN") redirect("/");

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="mb-4 flex items-center gap-2 sm:mb-6">
        <span className="rounded-full bg-vivrebio-rouge px-2.5 py-0.5 text-xs font-medium text-white">Admin</span>
        <h1 className="text-lg font-semibold text-encre sm:text-xl">Back-office Vivre Bio</h1>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <aside className="w-full shrink-0 md:w-48">
          <AdminNav />
        </aside>
        <section className="min-w-0 flex-1">{children}</section>
      </div>
    </main>
  );
}