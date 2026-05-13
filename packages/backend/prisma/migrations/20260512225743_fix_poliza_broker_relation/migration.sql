/*
  Warnings:

  - You are about to drop the column `creadoPorId` on the `Poliza` table. All the data in the column will be lost.
  - Added the required column `brokerId` to the `Poliza` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Poliza" DROP CONSTRAINT "Poliza_creadoPorId_fkey";

-- AlterTable
ALTER TABLE "Poliza" DROP COLUMN "creadoPorId",
ADD COLUMN     "brokerId" TEXT NOT NULL,
ADD COLUMN     "numeroReferencia" TEXT NOT NULL DEFAULT '';

-- AddForeignKey
ALTER TABLE "Poliza" ADD CONSTRAINT "Poliza_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
