-- AlterTable
ALTER TABLE "Poliza" ADD COLUMN     "coberturaId" TEXT;

-- CreateTable
CREATE TABLE "Cobertura" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "companiaId" TEXT NOT NULL,
    "tipoSeguro" "TipoSeguro" NOT NULL,

    CONSTRAINT "Cobertura_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Poliza" ADD CONSTRAINT "Poliza_coberturaId_fkey" FOREIGN KEY ("coberturaId") REFERENCES "Cobertura"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cobertura" ADD CONSTRAINT "Cobertura_companiaId_fkey" FOREIGN KEY ("companiaId") REFERENCES "CompaniaSeguros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
