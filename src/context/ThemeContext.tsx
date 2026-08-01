// src/context/ThemeContext.tsx
// Gère l'état du thème (clair/sombre), synchronisé avec localStorage et la
// classe .dark sur <html>.
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type ThemeContextType = {
  sombre: boolean;
  basculerTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [sombre, setSombre] = useState(false);

  useEffect(() => {
    setSombre(document.documentElement.classList.contains("dark"));
  }, []);

  function basculerTheme() {
    const nouveauSombre = !sombre;
    setSombre(nouveauSombre);
    document.documentElement.classList.toggle("dark", nouveauSombre);
    localStorage.setItem("vivrebio-theme", nouveauSombre ? "dark" : "light");
  }

  return <ThemeContext.Provider value={{ sombre, basculerTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme doit être utilisé à l'intérieur de <ThemeProvider>");
  return context;
}