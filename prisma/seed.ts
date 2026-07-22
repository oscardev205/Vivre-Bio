// prisma/seed.ts
// Script exécuté pour remplir la base avec nos catégories et produits.
// À relancer si on modifie produits.json (il vide et recrée les données).

import { PrismaClient } from "@prisma/client";
import produitsData from "./data/produits.json";

const prisma = new PrismaClient();

// Transforme "Huile essentielle d'Arbre à thé" en "huile-essentielle-d-arbre-a-the"
function toSlug(texte: string): string {
  return texte
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // enlève les accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("Nettoyage des anciennes données...");
  await prisma.orderItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log("Insertion des catégories et produits...");

  for (const cat of produitsData.categories) {
    const category = await prisma.category.create({
      data: {
        slug: cat.slug,
        nom: cat.nom,
        unite: cat.unite ?? null,
      },
    });

    for (const p of cat.produits) {
      await prisma.product.create({
        data: {
          nom: p.nom,
          slug: toSlug(p.nom),
          description: p.description,
          prix: p.prix,
          stock: 50, // stock de départ par défaut, à ajuster ensuite
          categoryId: category.id,
        },
      });
    }

    console.log(`  - ${cat.nom} : ${cat.produits.length} produits insérés`);
  }

  console.log("Seed terminé avec succès.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });