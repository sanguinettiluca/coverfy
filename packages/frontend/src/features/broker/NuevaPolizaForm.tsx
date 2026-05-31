import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listarCompanias } from "@/services/companias.service";
import { crearPoliza } from "@/services/polizas.service";

const tiposSeguro = {
    VEHICULO: {
        label: "Vehículo",
        detalleKey: "detalleVehiculo",
        campos: [
            { key: "marca", label: "Marca", tipo: "text" },
            { key: "modelo", label: "Modelo", tipo: "text" },
            { key: "anio", label: "Año", tipo: "number" },
            { key: "matricula", label: "Matrícula", tipo: "text" },
            { key: "padron", label: "Padrón", tipo: "text" },
            { key: "chasis", label: "Chasis", tipo: "text" },
            { key: "motor", label: "Motor", tipo: "text" },
        ],
    },
    VIAJE: {
        label: "Viaje",
        detalleKey: "detalleViaje",
        campos: [
            { key: "destino", label: "Destino", tipo: "text" },
            { key: "fechaSalida", label: "Fecha de salida", tipo: "date" },
            { key: "fechaRegreso", label: "Fecha de regreso", tipo: "date" },
            { key: "pasajeros", label: "Pasajeros", tipo: "number" },
        ],
    },
    ALQUILER: {
        label: "Alquiler",
        detalleKey: "detalleAlquiler",
        campos: [
            { key: "direccion", label: "Dirección", tipo: "text" },
            { key: "tipoInmueble", label: "Tipo de inmueble", tipo: "text" },
            { key: "valorAlquiler", label: "Valor del alquiler", tipo: "number" },
        ],
    },
    HOGAR: {
        label: "Hogar",
        detalleKey: "detalleHogar",
        campos: [
            { key: "direccion", label: "Dirección", tipo: "text" },
            { key: "tipoConstruccion", label: "Tipo de construcción", tipo: "text" },
            { key: "metrosCuadrados", label: "Metros cuadrados", tipo: "number" },
            { key: "valorPropiedad", label: "Valor de la propiedad", tipo: "number" },
        ],
    },
    COMERCIO: {
        label: "Comercio",
        detalleKey: "detalleComercio",
        campos: [
            { key: "razonSocial", label: "Razón social", tipo: "text" },
            { key: "rubro", label: "Rubro", tipo: "text" },
            { key: "direccion", label: "Dirección", tipo: "text" },
        ],
    },
    RESPONSABILIDAD_CIVIL: {
        label: "Responsabilidad Civil",
        detalleKey: "detalleResponsabilidadCivil",
        campos: [
            { key: "actividad", label: "Actividad", tipo: "text" },
            { key: "limiteCobertura", label: "Límite de cobertura", tipo: "number" },
        ],
    },
    FIANZA: {
        label: "Fianza",
        detalleKey: "detalleFianza",
        campos: [
            { key: "tipoFianza", label: "Tipo de fianza", tipo: "text" },
            { key: "montoGarantizado", label: "Monto garantizado", tipo: "number" },
            { key: "beneficiario", label: "Beneficiario", tipo: "text" },
        ],
    },
    VIDA: {
        label: "Vida",
        detalleKey: "detalleVida",
        campos: [
            { key: "sumaAsegurada", label: "Suma asegurada", tipo: "number" },
            { key: "beneficiario", label: "Beneficiario", tipo: "text" },
        ],
    },
    OTROS: {
        label: "Otros",
        detalleKey: "detalleOtros",
        campos: [{ key: "descripcion", label: "Descripción", tipo: "text" }],
    },
} as const;

type TipoSeguro = keyof typeof tiposSeguro;

interface NuevaPolizaFormProps{
    clienteId: string;
    onCreada: () => void;
    onCancelar: () => void;
}

export function NuevaPolizaForm({clienteId, onCreada, onCancelar} : NuevaPolizaFormProps){
    const queryClient = useQueryClient();
    const [tipo, setTipo] = useState<TipoSeguro | "">("");
    const [companiaId, setCompaniaId] = useState("");
    const [numeroPoliza, setNumeroPoliza] = useState("");
    const [detalle, setDetalle] = useState<Record<string, string>>({});

    const { data: companias = [] } = useQuery({
        queryKey: ["companias"],
        queryFn: listarCompanias,
    });

    const mutation = useMutation({
        mutationFn: () => {
            const config = tiposSeguro[tipo as TipoSeguro];

            const detalleParseado: Record<string, any> = {};
            config.campos.forEach((c) => {
                const valor = detalle[c.key] ?? "";
                detalleParseado[c.key] = c.tipo === "number" ? Number(valor) : valor;
            });

            return crearPoliza({
                numeroPoliza,
                tipoSeguro: tipo,
                clienteId,
                companiaId,
                [config.detalleKey]: detalleParseado,
            });
        },
        onSuccess: () => {
            toast.success("Poliza creada exitosamente!");
            queryClient.invalidateQueries({queryKey: ["polizas", clienteId]});
            onCreada();
        },
        onError: (error: any) => toast.error(error?.response?.data?.message ?? "Error al crear la póliza"),
    });

    const config = tipo ? tiposSeguro[tipo] : null;

    return (
    <div className="border border-border rounded-lg p-4 bg-card space-y-4">
      <h4 className="font-medium">Nueva póliza</h4>

      {/* Compañía */}
      <div className="space-y-1">
        <Label className="text-xs">Compañía aseguradora</Label>
        <select
          value={companiaId}
          onChange={(e) => setCompaniaId(e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Seleccionar...</option>
          {companias.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      {/* Tipo de seguro */}
      <div className="space-y-1">
        <Label className="text-xs">Tipo de seguro</Label>
        <select
          value={tipo}
          onChange={(e) => {
            setTipo(e.target.value as TipoSeguro);
            setDetalle({}); // limpiamos el detalle al cambiar de tipo
          }}
          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Seleccionar...</option>
          {Object.entries(tiposSeguro).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      {/* Número de póliza */}
      <div className="space-y-1">
        <Label className="text-xs">Número de póliza</Label>
        <Input
          className="h-9 text-sm"
          value={numeroPoliza}
          onChange={(e) => setNumeroPoliza(e.target.value)}
        />
      </div>

      {/* Campos dinámicos según el tipo */}
      {config && (
        <div className="space-y-3 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">Datos de {config.label}</p>
          <div className="grid grid-cols-2 gap-3">
            {config.campos.map((c) => (
              <div key={c.key} className="space-y-1">
                <Label className="text-xs">{c.label}</Label>
                <Input
                  type={c.tipo}
                  className="h-9 text-sm"
                  value={detalle[c.key] ?? ""}
                  onChange={(e) => setDetalle((d) => ({ ...d, [c.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button
          size="sm"
          className="flex-1 bg-primary text-primary-foreground"
          disabled={!tipo || !companiaId || !numeroPoliza || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar póliza
        </Button>
      </div>
    </div>
  );
}