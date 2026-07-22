// src/components/ui/Badge.tsx
// Petite étiquette colorée (utilisée pour "Nouveau", "Rupture de stock", etc.)

import clsx from "clsx";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "rouge" | "gris" | "vert";
};

export function Badge({ children, variant = "rouge" }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-white",
        variant === "rouge" && "bg-vivrebio-rouge",
        variant === "gris" && "bg-gray-400",
        variant === "vert" && "bg-vivrebio-vert"
      )}
    >
      {children}
    </span>
  );
}