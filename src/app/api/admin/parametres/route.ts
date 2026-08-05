// src/app/api/admin/parametres/route.ts
// Fichier complet : ajoute la valeur du point (FCFA) en plus de la fidélité
// et du parrainage déjà gérés ici.

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { estFideliteActive, setParametre } from "@/lib/parametres";
import { estParrainageActif, getTauxCommission, setTauxCommission } from "@/lib/parrainage";
import { getValeurPointFcfa, setValeurPointFcfa } from "@/lib/fidelite";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const [fideliteActive, parrainageActif, tauxCommission, valeurPointFcfa] = await Promise.all([
    estFideliteActive(),
    estParrainageActif(),
    getTauxCommission(),
    getValeurPointFcfa(),
  ]);

  return NextResponse.json({ fideliteActive, parrainageActif, tauxCommission, valeurPointFcfa });
}

export async function PATCH(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });

  const { fideliteActive, parrainageActif, tauxCommission, valeurPointFcfa } = await request.json();

  if (typeof fideliteActive === "boolean") await setParametre("fidelite_active", fideliteActive ? "true" : "false");
  if (typeof parrainageActif === "boolean") await setParametre("parrainage_actif", parrainageActif ? "true" : "false");
  if (typeof tauxCommission === "number" && tauxCommission >= 0 && tauxCommission <= 100) await setTauxCommission(tauxCommission);
  if (typeof valeurPointFcfa === "number" && valeurPointFcfa > 0) await setValeurPointFcfa(valeurPointFcfa);

  return NextResponse.json({ ok: true });
}