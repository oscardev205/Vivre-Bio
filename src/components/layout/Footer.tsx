// src/components/layout/Footer.tsx
// Pied de page présent sur toutes les pages.

export function Footer() {
  return (
    <footer className="mt-16 bg-vivrebio-vert py-8 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm md:flex-row">
        <span>Vivre Bio — Le meilleur de la nature pour vous</span>
        <div className="flex gap-4">
          <a href="/contact" className="hover:underline">Contact</a>
          <a href="/faq" className="hover:underline">FAQ</a>
          <a href="/livraison" className="hover:underline">Livraison</a>
        </div>
      </div>
    </footer>
  );
}