// src/components/ui/Button.tsx
// Bouton réutilisable avec 2 variantes : plein (vert) et contour (rouge).
// On centralise le style ici pour ne jamais réécrire les classes Tailwind à la main.

import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline";
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "rounded-lg px-5 py-2.5 text-sm font-medium transition",
        variant === "primary" && "bg-vivrebio-vert text-white hover:bg-green-800",
        variant === "outline" && "border-2 border-vivrebio-rouge text-vivrebio-rouge hover:bg-red-50",
        className
      )}
      {...props}
    />
  );
}