// src/components/admin/StatsCharts.tsx
// Fichier complet : hauteur augmentée, angle des libellés sur l'axe des mois
// (évite le chevauchement), marge élargie pour les noms de produits longs.
"use client";

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { VenteParMois, ProduitVendu } from "@/lib/stats";

export function GraphiqueVentes({ donnees }: { donnees: VenteParMois[] }) {
  if (donnees.length === 0) {
    return <p className="p-6 text-center text-sm text-encre/40">Pas encore assez de données de vente.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={donnees} margin={{ top: 5, right: 10, left: -10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ede7d9" />
        <XAxis
          dataKey="mois"
          tick={{ fontSize: 10, fill: "#1B2A1F" }}
          angle={-35}
          textAnchor="end"
          height={50}
          interval={0}
        />
        <YAxis tick={{ fontSize: 10, fill: "#1B2A1F" }} width={45} />
        <Tooltip
          formatter={(value) => [`${Number(value).toLocaleString("fr-FR")} FCFA`, "Chiffre d'affaires"]}
          contentStyle={{ borderRadius: 8, border: "1px solid #ede7d9", fontSize: 12 }}
        />
        <Line type="monotone" dataKey="total" stroke="#2E7D32" strokeWidth={2.5} dot={{ fill: "#2E7D32", r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function GraphiqueTopProduits({ donnees }: { donnees: ProduitVendu[] }) {
  if (donnees.length === 0) {
    return <p className="p-6 text-center text-sm text-encre/40">Pas encore de ventes enregistrées.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={donnees} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ede7d9" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 10, fill: "#1B2A1F" }} />
        <YAxis
          dataKey="nom"
          type="category"
          width={90}
          tick={{ fontSize: 9, fill: "#1B2A1F" }}
          tickFormatter={(nom: string) => (nom.length > 14 ? `${nom.slice(0, 14)}…` : nom)}
        />
        <Tooltip
          formatter={(value) => [`${value} unité(s)`, "Vendues"]}
          contentStyle={{ borderRadius: 8, border: "1px solid #ede7d9", fontSize: 12 }}
        />
        <Bar dataKey="quantiteVendue" fill="#7CB342" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}