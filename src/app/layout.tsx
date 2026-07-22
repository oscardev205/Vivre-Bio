// src/app/layout.tsx
// Layout racine : on y ajoute maintenant le Header et le Footer sur toutes les pages.

import type { Metadata } from "next";
import { Poppins, Great_Vibes } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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
      <body className={`${poppins.variable} ${greatVibes.variable} flex min-h-screen flex-col font-sans antialiased`}>
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}