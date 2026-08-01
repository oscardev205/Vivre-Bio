// src/app/robots.ts
// Génère automatiquement /robots.txt — autorise l'indexation du site public,
// bloque l'exploration des zones privées (admin, compte, API).

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/compte", "/api", "/commande"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}