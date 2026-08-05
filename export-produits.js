// export-produits.js
// Script ponctuel : exporte tous les produits avec leur slug exact, groupés
// par catégorie, dans un fichier CSV — pour savoir précisément comment
// renommer chaque photo.

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const prisma = new PrismaClient();

async function main() {
  const produits = await prisma.product.findMany({
    include: { category: true },
    orderBy: [{ category: { nom: "asc" } }, { nom: "asc" }],
  });

  const lignes = ["Catégorie,Nom du produit,Nom de fichier attendu"];
  for (const p of produits) {
    lignes.push(`"${p.category.nom}","${p.nom}","${p.slug}.jpg"`);
  }

  fs.writeFileSync("produits-a-renommer.csv", lignes.join("\n"), "utf-8");
  console.log(`Export terminé : ${produits.length} produits dans produits-a-renommer.csv`);
}

main().finally(() => prisma.$disconnect());