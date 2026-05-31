import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { obtenerPoliza, actualizarPoliza } from "@/services/polizas.service";

const detalleLabels: Record<string, { key: string; campos: Record<string, string> }> = {
    VEHICULO: { 
        key: "detalleVehiculo", 
        campos: { marca: "Marca", modelo: "Modelo", anio: "Año", matricula: "Matrícula", padron: "Padrón", chasis: "Chasis", motor: "Motor" } 
    },
    VIAJE: { 
        key: "detalleViaje", 
        campos: { destino: "Destino", fechaSalida: "Fecha de salida", fechaRegreso: "Fecha de regreso", pasajeros: "Pasajeros" } 
    },
    ALQUILER: {
        key: "detalleAlquiler",
        campos: { direccion: "Dirección", tipoInmueble: "Tipo de inmueble", valorAlquiler: "Valor del alquiler" } 
    },
    HOGAR: { 
        key: "detalleHogar", 
        campos: { direccion: "Dirección", tipoConstruccion: "Tipo de construcción", metrosCuadrados: "Metros cuadrados", valorPropiedad: "Valor de la propiedad" } 
    },
    COMERCIO: { 
        key: "detalleComercio", 
        campos: { razonSocial: "Razón social", rubro: "Rubro", direccion: "Dirección" } 
    },
    RESPONSABILIDAD_CIVIL: { 
        key: "detalleResponsabilidadCivil", 
        campos: { actividad: "Actividad", limiteCobertura: "Límite de cobertura" } 
    },
    FIANZA: { 
        key: "detalleFianza", 
        campos: { tipoFianza: "Tipo de fianza", montoGarantizado: "Monto garantizado", beneficiario: "Beneficiario" } 
    },
    VIDA: { 
        key: "detalleVida",
        campos: { sumaAsegurada: "Suma asegurada", beneficiario: "Beneficiario" } 
    },
    OTROS: { 
        key: "detalleOtros", 
        campos: { descripcion: "Descripción" } 
    }
};

const estados = ["ACTIVA", "VENCIDA", "CANCELADA", "SUSPENDIDA"];

interface PolizaDetalleProps{
    polizaId: string;
    onVolver: () => void;
}

export function PolizaDetalle({polizaId, onVolver}: PolizaDetalleProps){
    const queryClient = useQueryClient();
    const [editando, setEditando] = useState(false);
    const [form, setForm] = useState<Record<string, string>>({});

    const {data: poliza, isLoading} = useQuery({
        queryKey: ["poliza", polizaId],
        queryFn: () => obtenerPoliza(polizaId)
    });

    const mutation = useMutation({
        mutationFn: () => 
            actualizarPoliza(polizaId, {
                estado: form.estado,
                fechaInicio: form.fechaInicio || null,
                fechaVencimiento: form.fechaVencimiento || null,
                montoTotal: form.montoTotal ? Number(form.montoTotal) : undefined,
                cuotas: form.cuotas ? Number(form.cuotas) : undefined
            }),
            onSuccess: () => {
                toast.success("Poliza actualizada correctamente!");
                queryClient.invalidateQueries({ queryKey: ["poliza", polizaId] });
                setEditando(false);
            },
            onError: (error: any) => toast.error(error?.response?.data?.message ?? "Error al actualizar")
    });

    if(isLoading || !poliza){
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const detalleConfig = detalleLabels[poliza.tipoSeguro];
    const detalle = detalleConfig ? poliza[detalleConfig.key] : null;

    const iniciarEdicion = () => {
        setForm({
            estado: poliza.estado ?? "",
            fechaInicio: poliza.fechaInicio ? poliza.fechaInicio.split("T")[0] : "",
            fechaVencimiento: poliza.fechaVencimiento ? poliza.fechaVencimiento.split("T")[0] : "",
            montoTotal: poliza.montoTotal?.toString() ?? "",
            cuotas: poliza.cuotas?.toString() ?? ""
        });
        setEditando(true);
    };

    return (
        <div className="space-y-6">
            <Button variant="ghost" size="sm" onClick={onVolver} className="gap-2 -ml-2">
                <ArrowLeft className="h-4 w-4" /> Volver
            </Button>

            <div className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">{poliza.numeroPoliza}</h2>
                        <p className="text-sm text-muted-foreground">{poliza.tipoSeguro} · {poliza.compania?.nombre}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">{poliza.estado}</span>
                </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Datos de la póliza</h3>
                    {!editando && (
                        <Button size="sm" variant="outline" onClick={iniciarEdicion}>Editar</Button>
                    )}
                </div>

                {editando ? (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Estado</Label>
                            <select
                                value={form.estado}
                                onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value }))}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                >
                                {estados.map((e) => <option key={e} value={e}>{e}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Cuotas</Label>
                            <Input type="number" className="h-9 text-sm" value={form.cuotas} onChange={(e) => setForm((f) => ({ ...f, cuotas: e.target.value }))} />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Fecha inicio</Label>
                            <Input type="date" className="h-9 text-sm" value={form.fechaInicio} onChange={(e) => setForm((f) => ({ ...f, fechaInicio: e.target.value }))} />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Fecha vencimiento</Label>
                            <Input type="date" className="h-9 text-sm" value={form.fechaVencimiento} onChange={(e) => setForm((f) => ({ ...f, fechaVencimiento: e.target.value }))} />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Monto total</Label>
                            <Input type="number" className="h-9 text-sm" value={form.montoTotal} onChange={(e) => setForm((f) => ({ ...f, montoTotal: e.target.value }))} />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditando(false)}>Cancelar</Button>
                        <Button size="sm" className="flex-1 bg-primary text-primary-foreground" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
                            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar
                        </Button>
                    </div>
                </div>
                ) : (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <Dato label="Estado" valor={poliza.estado} />
                        <Dato label="Cuotas" valor={poliza.cuotas?.toString() ?? "—"} />
                        <Dato label="Fecha inicio" valor={poliza.fechaInicio?.split("T")[0] ?? "—"} />
                        <Dato label="Fecha vencimiento" valor={poliza.fechaVencimiento?.split("T")[0] ?? "—"} />
                        <Dato label="Monto total" valor={poliza.montoTotal?.toString() ?? "—"} />
                    </div>
                )}
            </div>

            {detalle && detalleConfig && (
                <div className="bg-card border border-border rounded-lg p-5">
                    <h3 className="font-semibold mb-4">Detalle de {poliza.tipoSeguro}</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        {Object.entries(detalleConfig.campos).map(([key, label]) => (
                        <Dato
                            key={key}
                            label={label}
                            valor={detalle[key] != null && detalle[key] !== "" ? String(detalle[key]).split("T")[0] : "—"}
                        />
                        ))}
                    </div>
                </div>
            )}
            
        </div>
    );
}

function Dato({ label, valor }: { label: string; valor: string }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-medium">{valor}</p>
        </div>
    );
}