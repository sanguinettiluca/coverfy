import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listCompanies } from "@/services/companies.service";
import { createPolicy } from "@/services/policies.service";

const insuranceTypes = {
    VEHICLE: {
        label: "Vehículo",
        detailsKey: "vehicleDetails",
        fields: [
            { key: "brand", label: "Marca", type: "text" },
            { key: "model", label: "Modelo", type: "text" },
            { key: "year", label: "Año", type: "number" },
            { key: "licensePlate", label: "Matrícula", type: "text" },
            { key: "registrationNumber", label: "Padrón", type: "text" },
            { key: "chassisNumber", label: "Chasis", type: "text" },
            { key: "engineNumber", label: "Motor", type: "text" },
        ],
    },
    TRIP: {
        label: "Viaje",
        detailsKey: "tripDetails",
        fields: [
            { key: "destination", label: "Destino", type: "text" },
            { key: "departureDate", label: "Fecha de salida", type: "date" },
            { key: "returnDate", label: "Fecha de regreso", type: "date" },
            { key: "passengers", label: "Pasajeros", type: "number" },
        ],
    },
    RENTAL: {
        label: "Alquiler",
        detailsKey: "rentalDetails",
        fields: [
            { key: "address", label: "Dirección", type: "text" },
            { key: "propertyType", label: "Tipo de inmueble", type: "text" },
            { key: "rentAmount", label: "Valor del alquiler", type: "number" },
        ],
    },
    HOME: {
        label: "Hogar",
        detailsKey: "homeDetails",
        fields: [
            { key: "address", label: "Dirección", type: "text" },
            { key: "constructionType", label: "Tipo de construcción", type: "text" },
            { key: "squareMeters", label: "Metros cuadrados", type: "number" },
            { key: "propertyValue", label: "Valor de la propiedad", type: "number" },
        ],
    },
    BUSINESS: {
        label: "Comercio",
        detailsKey: "businessDetails",
        fields: [
            { key: "businessName", label: "Razón social", type: "text" },
            { key: "industry", label: "Rubro", type: "text" },
            { key: "address", label: "Dirección", type: "text" },
        ],
    },
    LIABILITY: {
        label: "Responsabilidad Civil",
        detailsKey: "liabilityDetails",
        fields: [
            { key: "activity", label: "Actividad", type: "text" },
            { key: "coverageLimit", label: "Límite de cobertura", type: "number" },
        ],
    },
    BOND: {
        label: "Fianza",
        detailsKey: "bondDetails",
        fields: [
            { key: "bondType", label: "Tipo de fianza", type: "text" },
            { key: "guaranteedAmount", label: "Monto garantizado", type: "number" },
            { key: "beneficiary", label: "Beneficiario", type: "text" },
        ],
    },
    LIFE: {
        label: "Vida",
        detailsKey: "lifeDetails",
        fields: [
            { key: "insuredAmount", label: "Suma asegurada", type: "number" },
            { key: "beneficiary", label: "Beneficiario", type: "text" },
        ],
    },
    OTHER: {
        label: "Otros",
        detailsKey: "otherDetails",
        fields: [{ key: "description", label: "Descripción", type: "text" }],
    },
} as const;

type InsuranceTypeKey = keyof typeof insuranceTypes;

interface NewPolicyFormProps{
    clientId: string;
    onCreated: () => void;
    onCancel: () => void;
}

export function NewPolicyForm({clientId, onCreated, onCancel} : NewPolicyFormProps){
    const queryClient = useQueryClient();
    const [insuranceType, setInsuranceType] = useState<InsuranceTypeKey | "">("");
    const [companyId, setCompanyId] = useState("");
    const [policyNumber, setPolicyNumber] = useState("");
    const [details, setDetails] = useState<Record<string, string>>({});
    const [startDate, setStartDate] = useState("");
    const [expirationDate, setExpirationDate] = useState("");
    const [totalAmount, setTotalAmount] = useState("");
    const [installments, setInstallments] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");

    const { data: companies = [] } = useQuery({
        queryKey: ["companies"],
        queryFn: listCompanies,
    });

    const mutation = useMutation({
        mutationFn: () => {
            const config = insuranceTypes[insuranceType as InsuranceTypeKey];

            const parsedDetails: Record<string, any> = {};
            config.fields.forEach((f) => {
                const value = details[f.key] ?? "";
                parsedDetails[f.key] = f.type === "number" ? Number(value) : value;
            });

            return createPolicy({
              policyNumber,
              insuranceType,
              clientId,
              companyId,
              startDate: startDate ? new Date(startDate).toISOString() : null,
              expirationDate: expirationDate ? new Date(expirationDate).toISOString() : null,
              totalAmount: totalAmount ? Number(totalAmount) : 0,
              installments: installments ? Number(installments) : 1,
              paymentMethod: paymentMethod || null,
              [config.detailsKey]: parsedDetails,
            });
        },
        onSuccess: () => {
            toast.success("Poliza creada exitosamente!");
            queryClient.invalidateQueries({queryKey: ["policies", clientId]});
            onCreated();
        },
        onError: (error: any) => toast.error(error?.response?.data?.message ?? "Error al crear la póliza"),
    });

    const config = insuranceType ? insuranceTypes[insuranceType] : null;

    return (
    <div className="border border-border rounded-lg p-4 bg-card space-y-4">
      <h4 className="font-medium">Nueva póliza</h4>

      {/* Compañía */}
      <div className="space-y-1">
        <Label className="text-xs">Compañía aseguradora</Label>
        <select
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Seleccionar...</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Tipo de seguro</Label>
        <select
          value={insuranceType}
          onChange={(e) => {
            setInsuranceType(e.target.value as InsuranceTypeKey);
            setDetails({}); // limpiamos el detalle al cambiar de tipo
          }}
          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Seleccionar...</option>
          {Object.entries(insuranceTypes).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Número de póliza</Label>
        <Input
          className="h-9 text-sm"
          value={policyNumber}
          onChange={(e) => setPolicyNumber(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
        <div className="space-y-1">
          <Label className="text-xs">Fecha de inicio</Label>
          <Input type="date" className="h-9 text-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Fecha de vencimiento</Label>
          <Input type="date" className="h-9 text-sm" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Monto total</Label>
          <Input type="number" className="h-9 text-sm" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Cuotas</Label>
          <Input type="number" className="h-9 text-sm" value={installments} onChange={(e) => setInstallments(e.target.value)} />
        </div>
        <div className="space-y-1 col-span-2">
          <Label className="text-xs">Método de pago</Label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Seleccionar...</option>
            <option value="Debit">Débito</option>
            <option value="Credit">Crédito</option>
            <option value="Transfer">Transferencia</option>
            <option value="Cash">Efectivo</option>
          </select>
        </div>
      </div>

      {/* Campos segun el tipo de seguro */}
      {config && (
        <div className="space-y-3 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">Datos de {config.label}</p>
          <div className="grid grid-cols-2 gap-3">
            {config.fields.map((f) => (
              <div key={f.key} className="space-y-1">
                <Label className="text-xs">{f.label}</Label>
                <Input
                  type={f.type}
                  className="h-9 text-sm"
                  value={details[f.key] ?? ""}
                  onChange={(e) => setDetails((d) => ({ ...d, [f.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          size="sm"
          className="flex-1 bg-primary text-primary-foreground"
          disabled={!insuranceType || !companyId || !policyNumber || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar póliza
        </Button>
      </div>
    </div>
  );
}
