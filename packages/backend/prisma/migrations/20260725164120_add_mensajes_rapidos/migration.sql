-- CreateTable
CREATE TABLE "MensajeRapido" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MensajeRapido_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MensajeRapido" ADD CONSTRAINT "MensajeRapido_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
