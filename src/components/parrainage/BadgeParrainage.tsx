// src/components/parrainage/BadgeParrainage.tsx
"use client";

import { useEffect, useState } from "react";

export function BadgeParrainage() {
  const [nombre, setNombre] = useState(0);

  useEffect(() => {
    async function charger() {
      const res = await fetch("/api/parrainage/messages-non-lus");
      if (res.ok) setNombre((await res.json()).nombre);
    }
    charger();
    const interval = setInterval(charger, 30000);
    return () => clearInterval(interval);
  }, []);

  if (nombre === 0) return null;

  return (
    <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-vivrebio-rouge px-1 text-[10px] text-white">
      {nombre}
    </span>
  );
}