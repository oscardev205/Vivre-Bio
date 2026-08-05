// src/components/admin/AdminNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ClipboardList, Tag, MapPinned, MapPinPlus,
  Mail, Newspaper, CircleHelp, Gift, Users,
} from "lucide-react";
import { BadgeMessages } from "@/components/admin/BadgeMessages";

const liens = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/produits", label: "Produits", icon: Package },
  { href: "/admin/commandes", label: "Commandes", icon: ClipboardList, badge: true },
  { href: "/admin/promos", label: "Codes promo", icon: Tag },
  { href: "/admin/zones-livraison", label: "Zones de livraison", icon: MapPinned },
  { href: "/admin/demandes-livraison", label: "Demandes de zones", icon: MapPinPlus },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  { href: "/admin/fidelite", label: "Fidélité", icon: Gift },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/faq", label: "FAQ", icon: CircleHelp },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
];

export function AdminNav() {
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
            {badge && <BadgeMessages />}
          </Link>
        );
      })}
    </nav>
  );
}