// src/app/layout.tsx
// Layout racine de l'application : on y charge les polices officielles une seule fois.

import type { Metadata } from "next";
import { Poppins, Great_Vibes } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
});

export const metadata: Metadata = {
  title: "Vivre Bio — Le meilleur de la nature pour vous",
  description: "Produits naturels et bio : huiles essentielles, huiles végétales, poudres, infusions et cosmétiques.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${poppins.variable} ${greatVibes.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}