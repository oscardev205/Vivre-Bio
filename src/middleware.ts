// src/middleware.ts
// Protège automatiquement toutes les routes /compte/* : redirige vers /connexion
// si l'utilisateur n'est pas authentifié. S'exécute avant le rendu de la page.

export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/compte/:path*"],
};