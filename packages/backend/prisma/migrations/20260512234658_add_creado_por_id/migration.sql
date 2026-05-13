/*
  Warnings:

  - You are about to drop the column `brokerId` on the `Poliza` table. All the data in the column will be lost.
  - Added the required column `creadoPorId` to the `Poliza` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Poliza" DROP CONSTRAINT "Poliza_brokerId_fkey";

-- AlterTable
ALTER TABLE "Poliza" DROP COLUMN "brokerId",
ADD COLUMN     "creadoPorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Poliza" ADD CONSTRAINT "Poliza_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
