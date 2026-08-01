// src/components/ui/ProductImagePlaceholder.tsx
// Ajout d'une variante sombre : fond plus profond, texte clair — pour rester
// lisible dans les deux thèmes.

export function ProductImagePlaceholder({ nom }: { nom: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-lg bg-vert-pale dark:bg-[#1e3324]">
      <span className="text-3xl font-semibold text-encre/70">
        {nom.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}