// src/components/providers/ThemeScript.tsx
// Fichier complet : restauration du comportement d'origine — vérifie d'abord
// le choix explicite en localStorage, sinon se base sur les préférences système
// du visiteur. Comme le bouton de bascule est de nouveau visible, l'utilisateur
// peut toujours choisir lui-même s'il n'est pas d'accord avec la valeur par défaut.

import Script from "next/script";

export function ThemeScript() {
  return (
    <Script id="theme-script" strategy="beforeInteractive">
      {`
        (function() {
          try {
            var theme = localStorage.getItem('vivrebio-theme');
            if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
            }
          } catch (e) {}
        })();
      `}
    </Script>
  );
}