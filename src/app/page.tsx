// src/app/page.tsx
// Page d'accueil temporaire — juste pour vérifier que les couleurs Vivre Bio sont bien actives.

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-semibold text-vivrebio-vert">
        Vivre Bio
      </h1>
      <p className="text-vivrebio-rouge">
        Test de la couleur rouge officielle
      </p>
      <button className="rounded-lg bg-vivrebio-vert px-4 py-2 text-white">
        Bouton vert de test
      </button>
    </main>
  );
}