// src/components/layout/ThemeToggle.tsx
// Bouton soleil/lune dans le header, pour basculer le thème.
"use client";

import { FaSun, FaMoon } from "react-icons/fa6";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { sombre, basculerTheme } = useTheme();

  return (
    <button onClick={basculerTheme} aria-label="Changer de thème" className="text-encre">
      {sombre ? <FaSun size={17} /> : <FaMoon size={17} />}
    </button>
  );
}