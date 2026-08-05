/*
  Warnings:

  - A unique constraint covering the columns `[codeParrainage]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'LIVREUR';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "livraisonConfirmeePar" TEXT,
ADD COLUMN     "livreurId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "codeParrainage" TEXT,
ADD COLUMN     "disponible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parrainId" TEXT;

-- CreateTable
CREATE TABLE "GainParrainage" (
    "id" TEXT NOT NULL,
    "parrainId" TEXT NOT NULL,
    "filleulId" TEXT NOT NULL,
    "orderId" TEXT,
    "type" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GainParrainage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageParrainage" (
    "id" TEXT NOT NULL,
    "parrainId" TEXT NOT NULL,
    "filleulId" TEXT NOT NULL,
    "auteurId" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageParrainage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GainParrainage_orderId_key" ON "GainParrainage"("orderId");

-- CreateIndex
CREATE INDEX "MessageParrainage_parrainId_filleulId_idx" ON "MessageParrainage"("parrainId", "filleulId");

-- CreateIndex
CREATE UNIQUE INDEX "User_codeParrainage_key" ON "User"("codeParrainage");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_parrainId_fkey" FOREIGN KEY ("parrainId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_livreurId_fkey" FOREIGN KEY ("livreurId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GainParrainage" ADD CONSTRAINT "GainParrainage_parrainId_fkey" FOREIGN KEY ("parrainId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GainParrainage" ADD CONSTRAINT "GainParrainage_filleulId_fkey" FOREIGN KEY ("filleulId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GainParrainage" ADD CONSTRAINT "GainParrainage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
