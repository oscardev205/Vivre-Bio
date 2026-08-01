// maj-admin.js
// Script ponctuel pour passer un compte en ADMIN directement, sans Prisma Studio.
// Usage : node maj-admin.js ton-email@exemple.com

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const email = process.argv[2];

if (!email) {
  console.error("Usage : node maj-admin.js ton-email@exemple.com");
  process.exit(1);
}

prisma.user
  .update({ where: { email }, data: { role: "ADMIN" } })
  .then((user) => {
    console.log("Succès : ", user.email, "est maintenant ADMIN");
  })
  .catch((err) => {
    console.error("Erreur :", err.message);
  })
  .finally(() => prisma.$disconnect());