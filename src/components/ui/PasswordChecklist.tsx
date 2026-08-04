// src/components/ui/PasswordChecklist.tsx
// Affiche 3 cases à cocher qui se cochent automatiquement en direct au fur et
// à mesure que le mot de passe tapé respecte chaque condition — lecture seule,
// juste un retour visuel pour guider l'utilisateur pendant qu'il tape.
"use client";

type Props = { motDePasse: string };

export function PasswordChecklist({ motDePasse }: Props) {
  const criteres = [
    { label: "Au moins 8 caractères", valide: motDePasse.length >= 8 },
    { label: "Au moins une lettre", valide: /[A-Za-z]/.test(motDePasse) },
    { label: "Au moins un chiffre", valide: /[0-9]/.test(motDePasse) },
  ];

  return (
    <div className="flex flex-col gap-1 rounded-lg bg-vert-pale px-3 py-2">
      {criteres.map((c) => (
        <label key={c.label} className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={c.valide} readOnly className="h-3.5 w-3.5 accent-vivrebio-vert" />
          <span className={c.valide ? "font-medium text-vivrebio-vert" : "text-encre/50"}>{c.label}</span>
        </label>
      ))}
    </div>
  );
}