// src/components/admin/ExporterCSVButton.tsx
// Correction : ajout de la ligne "sep=," en tête de fichier — une instruction
// reconnue spécifiquement par Excel qui l'oblige à utiliser la virgule comme
// séparateur, indépendamment des réglages régionaux Windows (souvent configurés
// sur point-virgule en français).
"use client";

import { Download } from "lucide-react";

export function ExporterCSVButton({ donnees }: { donnees: { email: string; date: string }[] }) {
  function exporter() {
    const entetes = "email,date_inscription\n";
    const lignes = donnees
      .map((d) => `${d.email},${new Date(d.date).toLocaleDateString("fr-FR")}`)
      .join("\n");

    // "sep=," est une directive spéciale reconnue uniquement par Excel — les autres
    // outils (Google Sheets, LibreOffice, imports Mailchimp/Brevo) l'ignorent sans
    // problème, donc ça ne casse rien ailleurs.
    const csv = "sep=,\n" + entetes + lignes;

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = `newsletter-vivrebio-${new Date().toISOString().slice(0, 10)}.csv`;
    lien.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={exporter}
      className="flex items-center gap-1.5 rounded-lg border border-sable px-3 py-1.5 text-xs font-medium text-encre/70 hover:border-vivrebio-vert hover:text-vivrebio-vert"
    >
      <Download size={13} /> Exporter en CSV
    </button>
  );
}