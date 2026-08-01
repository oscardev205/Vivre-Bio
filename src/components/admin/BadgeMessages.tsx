// src/components/admin/BadgeMessages.tsx
// Badge rouge affichant le nombre de messages clients non lus, rafraîchi périodiquement.
"use client";

import { useEffect, useState } from "react";

export function BadgeMessages() {
  const [nombre, setNombre] = useState(0);

  useEffect(() => {
    async function charger() {
      const res = await fetch("/api/admin/messages-non-lus");
      if (res.ok) {
        const data = await res.json();
        setNombre(data.nombre);
      }
    }
    charger();
    const interval = setInterval(charger, 30000); // toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

  if (nombre === 0) return null;

  return (
    <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-vivrebio-rouge px-1 text-[10px] text-white">
      {nombre}
    </span>
  );
}