// src/components/compte/CompteNav.tsx
// Extrait la navigation de l'espace client dans un composant client dédié
// (usePathname a besoin du client), pour marquer visuellement l'onglet actif.
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, MapPin, Settings, Heart, Gift, Share2 } from "lucide-react";
import { BadgeMessagesClient } from "@/components/compte/BadgeMessagesClient";
import { BadgeParrainage } from "@/components/parrainage/BadgeParrainage";

const liens = [
  { href: "/compte", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/compte/commandes", label: "Mes commandes", icon: Package, badge: "commandes" },
  { href: "/compte/adresses", label: "Mes adresses", icon: MapPin },
  { href: "/compte/favoris", label: "Mes favoris", icon: Heart },
  { href: "/compte/fidelite", label: "Mes points", icon: Gift },
  { href: "/compte/parrainage", label: "Parrainage", icon: Share2, badge: "parrainage" },
  { href: "/compte/parametres", label: "Paramètres", icon: Settings },
];

export function CompteNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto pb-2 text-sm md:flex-col md:gap-1 md:overflow-visible md:pb-0">
      {liens.map(({ href, label, icon: Icon, exact, badge }) => {
        const actif = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 md:px-2 md:py-1.5 ${
              actif
                ? "border-vivrebio-vert bg-vert-pale font-medium text-vivrebio-vert md:border-l-2 md:border-y-0 md:border-r-0 md:rounded-l-none"
                : "border-sable text-encre hover:bg-vert-pale md:border-0"
            }`}
          >
            <Icon size={16} /> {label}
            {badge === "commandes" && <BadgeMessagesClient />}
            {badge === "parrainage" && <BadgeParrainage />}
          </Link>
        );
      })}
    </nav>
  );
}