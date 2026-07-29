// src/components/compte/DeconnexionButton.tsx
// Bouton de déconnexion — composant client car signOut() vient de next-auth/react.
"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function DeconnexionButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-vivrebio-rouge hover:bg-red-50"
    >
      <LogOut size={16} /> Se déconnecter
    </button>
  );
}