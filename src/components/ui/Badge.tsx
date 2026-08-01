// src/components/ui/Badge.tsx
// Ajustement : le variant "gris" utilise désormais un ton sable/encre au lieu
// d'un gris générique, pour rester dans la palette de marque.

import clsx from "clsx";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "rouge" | "gris" | "vert";
};

export function Badge({ children, variant = "rouge" }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "rouge" && "bg-vivrebio-rouge text-white",
        variant === "gris" && "bg-encre/10 text-encre",
        variant === "vert" && "bg-vivrebio-vert text-white"
      )}
    >
      {children}
    </span>
  );
}