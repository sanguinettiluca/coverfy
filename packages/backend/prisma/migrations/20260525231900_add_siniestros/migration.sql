-- CreateEnum
CREATE TYPE "EstadoSiniestro" AS ENUM ('ABIERTO', 'CERRADO');

-- CreateTable
CREATE TABLE "Siniestro" (
    "id" TEXT NOT NULL,
    "fechaSiniestro" TIMESTAMP(3) NOT NULL,
    "fechaContacto" TIMESTAMP(3),
    "notas" TEXT,
    "estado" "EstadoSiniestro" NOT NULL DEFAULT 'ABIERTO',
    "polizaId" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Siniestro_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Siniestro" ADD CONSTRAINT "Siniestro_polizaId_fkey" FOREIGN KEY ("polizaId") REFERENCES "Poliza"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Siniestro" ADD CONSTRAINT "Siniestro_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
