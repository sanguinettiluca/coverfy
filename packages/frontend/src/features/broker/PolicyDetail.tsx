import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPolicy, updatePolicy } from "@/services/policies.service";

const detailsLabels: Record<string, { key: string; fields: Record<string, string> }> = {
    VEHICLE: {
        key: "vehicleDetails",
        fields: { brand: "Marca", model: "Modelo", year: "Año", licensePlate: "Matrícula", registrationNumber: "Padrón", chassisNumber: "Chasis", engineNumber: "Motor" }
    },
    TRIP: {
        key: "tripDetails",
        fields: { destination: "Destino", departureDate: "Fecha de salida", returnDate: "Fecha de regreso", passengers: "Pasajeros" }
    },
    RENTAL: {
        key: "rentalDetails",
        fields: { address: "Dirección", propertyType: "Tipo de inmueble", rentAmount: "Valor del alquiler" }
    },
    HOME: {
        key: "homeDetails",
        fields: { address: "Dirección", constructionType: "Tipo de construcción", squareMeters: "Metros cuadrados", propertyValue: "Valor de la propiedad" }
    },
    BUSINESS: {
        key: "businessDetails",
        fields: { businessName: "Razón social", industry: "Rubro", address: "Dirección" }
    },
    LIABILITY: {
        key: "liabilityDetails",
        fields: { activity: "Actividad", coverageLimit: "Límite de cobertura" }
    },
    BOND: {
        key: "bondDetails",
        fields: { bondType: "Tipo de fianza", guaranteedAmount: "Monto garantizado", beneficiary: "Beneficiario" }
    },
    LIFE: {
        key: "lifeDetails",
        fields: { insuredAmount: "Suma asegurada", beneficiary: "Beneficiario" }
    },
    OTHER: {
        key: "otherDetails",
        fields: { description: "Descripción" }
    }
};

const statuses = ["ACTIVE", "EXPIRED", "CANCELLED", "SUSPENDED"];

interface PolicyDetailProps{
    policyId: string;
    onBack: () => void;
}

export function PolicyDetail({policyId, onBack}: PolicyDetailProps){
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<Record<string, string>>({});

    const {data: policy, isLoading} = useQuery({
        queryKey: ["policy", policyId],
        queryFn: () => getPolicy(policyId)
    });

    const mutation = useMutation({
        mutationFn: () =>
            updatePolicy(policyId, {
                status: form.status,
                startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
                expirationDate: form.expirationDate ? new Date(form.expirationDate).toISOString() : null,
                totalAmount: form.totalAmount ? Number(form.totalAmount) : undefined,
                installments: form.installments ? Number(form.installments) : undefined
            }),
            onSuccess: () => {
                toast.success("Poliza actualizada correctamente!");
                queryClient.invalidateQueries({ queryKey: ["policy", policyId] });
                setIsEditing(false);
            },
            onError: (error: any) => toast.error(error?.response?.data?.message ?? "Error al actualizar")
    });

    if(isLoading || !policy){
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const detailsConfig = detailsLabels[policy.insuranceType];
    const details = detailsConfig ? policy[detailsConfig.key] : null;

    const startEditing = () => {
        setForm({
            status: policy.status ?? "",
            startDate: policy.startDate ? policy.startDate.split("T")[0] : "",
            expirationDate: policy.expirationDate ? policy.expirationDate.split("T")[0] : "",
            totalAmount: policy.totalAmount?.toString() ?? "",
            installments: policy.installments?.toString() ?? ""
        });
        setIsEditing(true);
    };

    return (
        <div className="space-y-6">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ml-2">
                <ArrowLeft className="h-4 w-4" /> Volver
            </Button>

            <div className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">{policy.policyNumber}</h2>
                        <p className="text-sm text-muted-foreground">{policy.insuranceType} · {policy.company?.name}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">{policy.status}</span>
                </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Datos de la póliza</h3>
                    {!isEditing && (
                        <Button size="sm" variant="outline" onClick={startEditing}>Editar</Button>
                    )}
                </div>

                {isEditing ? (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Estado</Label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                >
                                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Cuotas</Label>
                            <Input type="number" className="h-9 text-sm" value={form.installments} onChange={(e) => setForm((f) => ({ ...f, installments: e.target.value }))} />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Fecha inicio</Label>
                            <Input type="date" className="h-9 text-sm" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Fecha vencimiento</Label>
                            <Input type="date" className="h-9 text-sm" value={form.expirationDate} onChange={(e) => setForm((f) => ({ ...f, expirationDate: e.target.value }))} />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Monto total</Label>
                            <Input type="number" className="h-9 text-sm" value={form.totalAmount} onChange={(e) => setForm((f) => ({ ...f, totalAmount: e.target.value }))} />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>Cancelar</Button>
                        <Button size="sm" className="flex-1 bg-primary text-primary-foreground" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
                            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar
                        </Button>
                    </div>
                </div>
                ) : (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <DataItem label="Estado" value={policy.status} />
                        <DataItem label="Cuotas" value={policy.installments?.toString() ?? "—"} />
                        <DataItem label="Fecha inicio" value={policy.startDate?.split("T")[0] ?? "—"} />
                        <DataItem label="Fecha vencimiento" value={policy.expirationDate?.split("T")[0] ?? "—"} />
                        <DataItem label="Monto total" value={policy.totalAmount?.toString() ?? "—"} />
                    </div>
                )}
            </div>

            {details && detailsConfig && (
                <div className="bg-card border border-border rounded-lg p-5">
                    <h3 className="font-semibold mb-4">Detalle de {policy.insuranceType}</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        {Object.entries(detailsConfig.fields).map(([key, label]) => (
                        <DataItem
                            key={key}
                            label={label}
                            value={details[key] != null && details[key] !== "" ? String(details[key]).split("T")[0] : "—"}
                        />
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}

function DataItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    );
}
