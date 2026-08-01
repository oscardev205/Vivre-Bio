// src/components/produits/Etoiles.tsx
// Affichage d'une note en étoiles — lecture seule ou sélectionnable (formulaire d'avis).

import { FaStar } from "react-icons/fa6";

type Props = {
  note: number;
  onChange?: (note: number) => void;
  taille?: number;
};

export function Etoiles({ note, onChange, taille = 14 }: Props) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          <FaStar size={taille} className={n <= note ? "text-yellow-400" : "text-sable-fonce"} />
        </button>
      ))}
    </div>
  );
}