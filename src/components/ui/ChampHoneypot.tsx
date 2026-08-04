// src/components/ui/ChampHoneypot.tsx
// Champ invisible pour les humains (caché par CSS, pas par un simple "hidden"
// détectable), rempli uniquement par des robots qui remplissent tout
// automatiquement. Nom volontairement anodin ("site_web") pour ne pas attirer
// l'attention d'un bot qui chercherait "honeypot" ou "trap" dans le code.

export function ChampHoneypot() {
  return (
    <input
      type="text"
      name="site_web"
      autoComplete="off"
      tabIndex={-1}
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-9999px",
        width: "1px",
        height: "1px",
        opacity: 0,
      }}
    />
  );
}