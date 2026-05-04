-- CreateEnum
CREATE TYPE "TipoSeguro" AS ENUM ('VEHICULO', 'VIAJE', 'ALQUILER', 'HOGAR', 'COMERCIO', 'RESPONSABILIDAD_CIVIL', 'FIANZA', 'VIDA', 'OTROS');

-- CreateEnum
CREATE TYPE "EstadoPoliza" AS ENUM ('ACTIVA', 'VENCIDA', 'CANCELADA', 'SUSPENDIDA');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('Debito', 'Credito', 'Transferencia', 'Efectivo');

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3),
    "celular" TEXT NOT NULL,
    "celularAlternativo" TEXT,
    "email" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "notas" TEXT,
    "creadoPorId" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompaniaSeguros" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompaniaSeguros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Poliza" (
    "id" TEXT NOT NULL,
    "numeroPoliza" TEXT NOT NULL DEFAULT '',
    "tipoSeguro" "TipoSeguro" NOT NULL,
    "estado" "EstadoPoliza" NOT NULL DEFAULT 'ACTIVA',
    "fechaInicio" TIMESTAMP(3),
    "fechaVencimiento" TIMESTAMP(3),
    "montoTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cuotas" INTEGER NOT NULL DEFAULT 1,
    "metodoPago" "MetodoPago" NOT NULL DEFAULT 'Debito',
    "clienteId" TEXT NOT NULL,
    "companiaId" TEXT NOT NULL,
    "creadoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Poliza_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetalleVehiculo" (
    "id" TEXT NOT NULL,
    "polizaId" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "anio" INTEGER,
    "matricula" TEXT NOT NULL DEFAULT '',
    "padron" TEXT NOT NULL DEFAULT '',
    "chasis" TEXT NOT NULL DEFAULT '',
    "motor" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "DetalleVehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetalleViaje" (
    "id" TEXT NOT NULL,
    "polizaId" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "fechaSalida" TIMESTAMP(3),
    "fechaRegreso" TIMESTAMP(3),
    "pasajeros" INTEGER,

    CONSTRAINT "DetalleViaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetalleAlquiler" (
    "id" TEXT NOT NULL,
    "polizaId" TEXT NOT NULL,
    "direccion" TEXT NOT NULL DEFAULT '',
    "tipoInmueble" TEXT NOT NULL DEFAULT '',
    "valorAlquiler" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "DetalleAlquiler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetalleHogar" (
    "id" TEXT NOT NULL,
    "polizaId" TEXT NOT NULL,
    "direccion" TEXT NOT NULL DEFAULT '',
    "tipoConstruccion" TEXT NOT NULL DEFAULT '',
    "metrosCuadrados" INTEGER,
    "valorPropiedad" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "DetalleHogar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetalleComercio" (
    "id" TEXT NOT NULL,
    "polizaId" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL DEFAULT '',
    "rubro" TEXT NOT NULL DEFAULT '',
    "direccion" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "DetalleComercio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetalleResponsabilidadCivil" (
    "id" TEXT NOT NULL,
    "polizaId" TEXT NOT NULL,
    "actividad" TEXT NOT NULL DEFAULT '',
    "limiteCobertura" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "DetalleResponsabilidadCivil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetalleFianza" (
    "id" TEXT NOT NULL,
    "polizaId" TEXT NOT NULL,
    "tipoFianza" TEXT NOT NULL DEFAULT '',
    "montoGarantizado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "beneficiario" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "DetalleFianza_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetalleVida" (
    "id" TEXT NOT NULL,
    "polizaId" TEXT NOT NULL,
    "sumaAsegurada" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "beneficiario" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "DetalleVida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetalleOtros" (
    "id" TEXT NOT NULL,
    "polizaId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "DetalleOtros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "polizaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DetalleVehiculo_polizaId_key" ON "DetalleVehiculo"("polizaId");

-- CreateIndex
CREATE UNIQUE INDEX "DetalleViaje_polizaId_key" ON "DetalleViaje"("polizaId");

-- CreateIndex
CREATE UNIQUE INDEX "DetalleAlquiler_polizaId_key" ON "DetalleAlquiler"("polizaId");

-- CreateIndex
CREATE UNIQUE INDEX "DetalleHogar_polizaId_key" ON "DetalleHogar"("polizaId");

-- CreateIndex
CREATE UNIQUE INDEX "DetalleComercio_polizaId_key" ON "DetalleComercio"("polizaId");

-- CreateIndex
CREATE UNIQUE INDEX "DetalleResponsabilidadCivil_polizaId_key" ON "DetalleResponsabilidadCivil"("polizaId");

-- CreateIndex
CREATE UNIQUE INDEX "DetalleFianza_polizaId_key" ON "DetalleFianza"("polizaId");

-- CreateIndex
CREATE UNIQUE INDEX "DetalleVida_polizaId_key" ON "DetalleVida"("polizaId");

-- CreateIndex
CREATE UNIQUE INDEX "DetalleOtros_polizaId_key" ON "DetalleOtros"("polizaId");

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompaniaSeguros" ADD CONSTRAINT "CompaniaSeguros_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poliza" ADD CONSTRAINT "Poliza_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poliza" ADD CONSTRAINT "Poliza_companiaId_fkey" FOREIGN KEY ("companiaId") REFERENCES "CompaniaSeguros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poliza" ADD CONSTRAINT "Poliza_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleVehiculo" ADD CONSTRAINT "DetalleVehiculo_polizaId_fkey" FOREIGN KEY ("polizaId") REFERENCES "Poliza"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleViaje" ADD CONSTRAINT "DetalleViaje_polizaId_fkey" FOREIGN KEY ("polizaId") REFERENCES "Poliza"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleAlquiler" ADD CONSTRAINT "DetalleAlquiler_polizaId_fkey" FOREIGN KEY ("polizaId") REFERENCES "Poliza"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleHogar" ADD CONSTRAINT "DetalleHogar_polizaId_fkey" FOREIGN KEY ("polizaId") REFERENCES "Poliza"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleComercio" ADD CONSTRAINT "DetalleComercio_polizaId_fkey" FOREIGN KEY ("polizaId") REFERENCES "Poliza"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleResponsabilidadCivil" ADD CONSTRAINT "DetalleResponsabilidadCivil_polizaId_fkey" FOREIGN KEY ("polizaId") REFERENCES "Poliza"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleFianza" ADD CONSTRAINT "DetalleFianza_polizaId_fkey" FOREIGN KEY ("polizaId") REFERENCES "Poliza"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleVida" ADD CONSTRAINT "DetalleVida_polizaId_fkey" FOREIGN KEY ("polizaId") REFERENCES "Poliza"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleOtros" ADD CONSTRAINT "DetalleOtros_polizaId_fkey" FOREIGN KEY ("polizaId") REFERENCES "Poliza"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_polizaId_fkey" FOREIGN KEY ("polizaId") REFERENCES "Poliza"("id") ON DELETE CASCADE ON UPDATE CASCADE;
