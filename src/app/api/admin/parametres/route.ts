// src/app/api/admin/parametres/route.ts
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { estFideliteActive, setParametre } from "@/lib/parametres";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const fideliteActive = await estFideliteActive();
  return NextResponse.json({ fideliteActive });
}

export async function PATCH(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const { fideliteActive } = await request.json();
  await setParametre("fidelite_active", fideliteActive ? "true" : "false");
  return NextResponse.json({ ok: true });
}