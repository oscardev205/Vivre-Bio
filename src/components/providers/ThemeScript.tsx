// src/components/providers/ThemeScript.tsx
// Fichier complet : ignore désormais prefers-color-scheme (préférences système)
// tant que le bouton de bascule est masqué dans la navbar — seul un choix explicite
// via localStorage (impossible sans bouton visible) peut activer le sombre.
// Garantit un mode clair cohérent partout, peu importe l'appareil qui consulte.

import Script from "next/script";

export function ThemeScript() {
  return (
    <Script id="theme-script" strategy="beforeInteractive">
      {`
        (function() {
          try {
            var theme = localStorage.getItem('vivrebio-theme');
            if (theme === 'dark') {
              document.documentElement.classList.add('dark');
            }
          } catch (e) {}
        })();
      `}
    </Script>
  );
}