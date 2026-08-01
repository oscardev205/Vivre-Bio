-- CreateEnum
CREATE TYPE "PromoType" AS ENUM ('POURCENTAGE', 'MONTANT_FIXE');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "montantReduction" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "promoCodeId" TEXT;

-- CreateTable
CREATE TABLE "PromoCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "PromoType" NOT NULL,
    "valeur" INTEGER NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "dateExpiration" TIMESTAMP(3),
    "utilisationMax" INTEGER,
    "nombreUtilisations" INTEGER NOT NULL DEFAULT 0,
    "montantMinimum" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
