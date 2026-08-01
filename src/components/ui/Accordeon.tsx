// src/components/ui/Accordeon.tsx
// Question cliquable qui déplie/replie sa réponse — évite d'afficher toutes
// les réponses en même temps sur une longue FAQ.
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function Accordeon({ question, reponse }: { question: string; reponse: string }) {
  const [ouvert, setOuvert] = useState(false);

  return (
    <div className="carte-3d overflow-hidden">
      <button
        onClick={() => setOuvert((v) => !v)}
        className="flex w-full items-center justify-between p-4 text-left text-sm font-medium text-encre"
      >
        {question}
        <ChevronDown size={16} className={`shrink-0 text-vivrebio-vert transition-transform ${ouvert ? "rotate-180" : ""}`} />
      </button>
      {ouvert && (
        <div className="border-t border-sable px-4 py-3 text-sm text-encre/60">
          {reponse}
        </div>
      )}
    </div>
  );
}