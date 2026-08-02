// src/app/layout.tsx
// Fichier complet : ThemeScript et ThemeProvider réintégrés.

import type { Metadata } from "next";
import { Poppins, Great_Vibes } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ThemeScript } from "@/components/providers/ThemeScript";
import { SessionProviderWrapper } from "@/components/providers/SessionProviderWrapper";
import { SITE_URL } from "@/lib/seo";
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vivre Bio — Le meilleur de la nature pour vous",
    template: "%s | Vivre Bio",
  },
  description: "Produits naturels et bio : huiles essentielles, huiles végétales, poudres, infusions et cosmétiques. Livraison à Cotonou et partout au Bénin.",
  openGraph: {
    siteName: "Vivre Bio",
    type: "website",
    locale: "fr_FR",
    title: "Vivre Bio — Le meilleur de la nature pour vous",
    description: "Produits naturels et bio : huiles essentielles, huiles végétales, poudres, infusions et cosmétiques.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vivre Bio — Le meilleur de la nature pour vous",
    description: "Produits naturels et bio, sélectionnés avec exigence.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${poppins.variable} ${greatVibes.variable} flex min-h-screen flex-col font-sans antialiased`}>
        <ThemeProvider>
          <SessionProviderWrapper>
            <CartProvider>
              <Header />
              <div className="flex-1">{children}</div>
              <Footer />
            </CartProvider>
          </SessionProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}