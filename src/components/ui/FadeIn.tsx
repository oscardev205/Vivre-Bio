// src/components/ui/FadeIn.tsx
// Fait apparaître son contenu en fondu + léger glissement dès qu'il entre dans l'écran.
// Utilise IntersectionObserver — léger, pas de librairie d'animation externe.
"use client";

import { useEffect, useRef, useState } from "react";

export function FadeIn({
  children,
  delai = 0,
  className = "",
}: {
  children: React.ReactNode;
  delai?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // une seule fois, pas de clignotement en re-scrollant
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${visible ? "anim-apparition" : "opacity-0"} ${className}`}
      style={{ animationDelay: visible ? `${delai}ms` : undefined }}
    >
      {children}
    </div>
  );
}