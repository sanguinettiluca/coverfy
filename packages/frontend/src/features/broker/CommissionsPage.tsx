import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listCompanies, updateCompany, Company } from "@/services/companies.service";
import { listActivePoliciesByCompany } from "@/services/policies.service";
import { toast } from "sonner";

const TYPE_LABEL: Record<string, string> = {
  VEHICLE: "Vehículo",
  TRIP: "Viaje",
  RENTAL: "Alquiler",
  HOME: "Hogar",
  BUSINESS: "Comercio",
  LIABILITY: "Resp. Civil",
  BOND: "Fianza",
  LIFE: "Vida",
  OTHER: "Otros",
};

function formatMoney(value: number) {
  return value.toLocaleString("es-UY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function CommissionsPage() {
  const queryClient = useQueryClient();
  const [companyId, setCompanyId] = useState<string>("");
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [rateInput, setRateInput] = useState("");

  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["companies"],
    queryFn: listCompanies,
  });

  const company = companies.find((c) => c.id === companyId) ?? null;

  const { data: policies = [], isLoading: isLoadingPolicies } = useQuery({
    queryKey: ["commissions-policies", companyId],
    queryFn: () => listActivePoliciesByCompany(companyId),
    enabled: !!companyId,
  });

  const mutation = useMutation({
    mutationFn: (commissionRate: number) =>
      updateCompany(companyId, { commissionRate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      setIsEditingRate(false);
      toast.success("Porcentaje de comisión actualizado");
    },
    onError: () => toast.error("Error al actualizar el porcentaje"),
  });

  const totalAmount = policies.reduce((s: number, p: any) => s + (p.totalAmount ?? 0), 0);
  const totalCommission = company ? totalAmount * (company.commissionRate / 100) : 0;

  const startEditingRate = () => {
    setRateInput(String(company?.commissionRate ?? 0));
    setIsEditingRate(true);
  };

  const saveRate = () => {
    const val = parseFloat(rateInput);
    if (isNaN(val) || val < 0 || val > 100) {
      toast.error("El porcentaje debe ser un número entre 0 y 100");
      return;
    }
    mutation.mutate(val);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Comisiones</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Seleccioná una compañía para ver sus pólizas activas y el total de comisión generado.
        </p>
      </div>

      {isLoadingCompanies ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Cargando compañías…</span>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <select
            value={companyId}
            onChange={(e) => {
              setCompanyId(e.target.value);
              setIsEditingRate(false);
            }}
            className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">— Seleccionar compañía —</option>
            {companies.map((c: Company) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.commissionRate}%)
              </option>
            ))}
          </select>
        </div>
      )}

      {company && (
        <>
          {/* Header de compañía con edición de % */}
          <div className="flex items-center gap-3 border rounded-lg px-4 py-3 bg-muted/40">
            <span className="font-semibold text-base">{company.name}</span>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-sm text-muted-foreground">Comisión:</span>
            {isEditingRate ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={rateInput}
                  onChange={(e) => setRateInput(e.target.value)}
                  className="w-20 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm">%</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={saveRate}
                  disabled={mutation.isPending}
                  className="h-7 w-7 p-0"
                >
                  {mutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingRate(false)}
                  disabled={mutation.isPending}
                  className="h-7 w-7 p-0"
                >
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="font-medium text-sm">{company.commissionRate}%</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={startEditingRate}
                  className="h-6 w-6 p-0 ml-1"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>

          {/* Tarjetas de resumen */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 bg-background">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Pólizas activas
              </p>
              <p className="text-2xl font-bold">{policies.length}</p>
            </div>
            <div className="border rounded-lg p-4 bg-background">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Prima total
              </p>
              <p className="text-2xl font-bold">$ {formatMoney(totalAmount)}</p>
            </div>
            <div className="border rounded-lg p-4 bg-green-50 border-green-200">
              <p className="text-xs text-green-700 uppercase tracking-wide mb-1">
                Comisión total ({company.commissionRate}%)
              </p>
              <p className="text-2xl font-bold text-green-700">$ {formatMoney(totalCommission)}</p>
            </div>
          </div>

          {/* Tabla de pólizas */}
          {isLoadingPolicies ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Cargando pólizas…</span>
            </div>
          ) : policies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg">
              No hay pólizas activas para esta compañía.
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">N° Póliza</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cliente</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Monto Total</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Comisión</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {policies.map((p: any) => {
                    const commission = (p.totalAmount ?? 0) * (company.commissionRate / 100);
                    return (
                      <tr key={p.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-mono">{p.policyNumber || "—"}</td>
                        <td className="px-4 py-3">{TYPE_LABEL[p.insuranceType] ?? p.insuranceType}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {p.client ? `${p.client.firstName} ${p.client.lastName}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">$ {formatMoney(p.totalAmount ?? 0)}</td>
                        <td className="px-4 py-3 text-right font-medium text-green-700">
                          $ {formatMoney(commission)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
