// src/components/providers/ThemeScript.tsx
// Fichier complet : utilise next/script avec strategy="beforeInteractive"
// (la méthode officiellement recommandée par Next.js pour les scripts anti-flash
// de thème), au lieu d'un <script> brut qui déclenchait un avertissement React.

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