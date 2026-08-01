// src/components/providers/ThemeScript.tsx
// Fichier complet : neutralise activement le mode sombre — supprime la classe
// "dark" si elle traîne, et efface toute préférence déjà stockée en localStorage
// depuis les tests précédents. Garantit un mode clair partout, peu importe ce
// qu'un navigateur avait mémorisé avant qu'on cache le bouton.

import Script from "next/script";

export function ThemeScript() {
  return (
    <Script id="theme-script" strategy="beforeInteractive">
      {`
        (function() {
          try {
            document.documentElement.classList.remove('dark');
            localStorage.removeItem('vivrebio-theme');
          } catch (e) {}
        })();
      `}
    </Script>
  );
}