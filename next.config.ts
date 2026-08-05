// next.config.ts
// Fichier complet : ajout de images.remotePatterns pour autoriser l'affichage
// des photos hébergées sur Vercel Blob, et mise à jour de la CSP (img-src)
// pour les autoriser aussi — le reste du fichier reste identique à avant.

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },

  async headers() {
    const estDeveloppement = process.env.NODE_ENV !== "production";

    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' ${estDeveloppement ? "'unsafe-eval'" : ""} https://cdn.kkiapay.me`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://*.tile.openstreetmap.org https://*.public.blob.vercel-storage.com",
      "font-src 'self' data:",
      "connect-src 'self' https://*.kkiapay.me",
      "frame-src 'self' https://*.kkiapay.me",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
        ],
      },
    ];
  },
};

export default nextConfig;