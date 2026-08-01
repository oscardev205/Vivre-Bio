-- CreateEnum
CREATE TYPE "ModeLivraison" AS ENUM ('LIVRAISON', 'RETRAIT');

-- CreateEnum
CREATE TYPE "DemandeLivraisonStatut" AS ENUM ('EN_ATTENTE', 'APPROUVEE', 'REFUSEE');

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_addressId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "contactNom" TEXT,
ADD COLUMN     "contactTelephone" TEXT,
ADD COLUMN     "modeLivraison" "ModeLivraison" NOT NULL DEFAULT 'LIVRAISON',
ALTER COLUMN "addressId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "DeliveryRequest" (
    "id" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT,
    "statut" "DemandeLivraisonStatut" NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
