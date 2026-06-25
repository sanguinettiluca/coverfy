import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listarCompanias, actualizarCompania, Compania } from "@/services/companias.service";
import { listarPolizasActivasPorCompania } from "@/services/polizas.service";
import { toast } from "sonner";

const TIPO_LABEL: Record<string, string> = {
  VEHICULO: "Vehículo",
  VIAJE: "Viaje",
  ALQUILER: "Alquiler",
  HOGAR: "Hogar",
  COMERCIO: "Comercio",
  RESPONSABILIDAD_CIVIL: "Resp. Civil",
  FIANZA: "Fianza",
  VIDA: "Vida",
  OTROS: "Otros",
};

function formatMoney(value: number) {
  return value.toLocaleString("es-UY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function ComisionesPage() {
  const queryClient = useQueryClient();
  const [companiaId, setCompaniaId] = useState<string>("");
  const [editandoPct, setEditandoPct] = useState(false);
  const [pctInput, setPctInput] = useState("");

  const { data: companias = [], isLoading: cargandoCompanias } = useQuery({
    queryKey: ["companias"],
    queryFn: listarCompanias,
  });

  const compania = companias.find((c) => c.id === companiaId) ?? null;

  const { data: polizas = [], isLoading: cargandoPolizas } = useQuery({
    queryKey: ["comisiones-polizas", companiaId],
    queryFn: () => listarPolizasActivasPorCompania(companiaId),
    enabled: !!companiaId,
  });

  const mutation = useMutation({
    mutationFn: (porcentajeComision: number) =>
      actualizarCompania(companiaId, { porcentajeComision }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companias"] });
      setEditandoPct(false);
      toast.success("Porcentaje de comisión actualizado");
    },
    onError: () => toast.error("Error al actualizar el porcentaje"),
  });

  const totalMonto = polizas.reduce((s: number, p: any) => s + (p.montoTotal ?? 0), 0);
  const totalComision = compania ? totalMonto * (compania.porcentajeComision / 100) : 0;

  const iniciarEdicion = () => {
    setPctInput(String(compania?.porcentajeComision ?? 0));
    setEditandoPct(true);
  };

  const guardarPct = () => {
    const val = parseFloat(pctInput);
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

      {cargandoCompanias ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Cargando compañías…</span>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <select
            value={companiaId}
            onChange={(e) => {
              setCompaniaId(e.target.value);
              setEditandoPct(false);
            }}
            className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">— Seleccionar compañía —</option>
            {companias.map((c: Compania) => (
              <option key={c.id} value={c.id}>
                {c.nombre} ({c.porcentajeComision}%)
              </option>
            ))}
          </select>
        </div>
      )}

      {compania && (
        <>
          {/* Header de compañía con edición de % */}
          <div className="flex items-center gap-3 border rounded-lg px-4 py-3 bg-muted/40">
            <span className="font-semibold text-base">{compania.nombre}</span>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-sm text-muted-foreground">Comisión:</span>
            {editandoPct ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={pctInput}
                  onChange={(e) => setPctInput(e.target.value)}
                  className="w-20 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm">%</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={guardarPct}
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
                  onClick={() => setEditandoPct(false)}
                  disabled={mutation.isPending}
                  className="h-7 w-7 p-0"
                >
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="font-medium text-sm">{compania.porcentajeComision}%</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={iniciarEdicion}
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
              <p className="text-2xl font-bold">{polizas.length}</p>
            </div>
            <div className="border rounded-lg p-4 bg-background">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Prima total
              </p>
              <p className="text-2xl font-bold">$ {formatMoney(totalMonto)}</p>
            </div>
            <div className="border rounded-lg p-4 bg-green-50 border-green-200">
              <p className="text-xs text-green-700 uppercase tracking-wide mb-1">
                Comisión total ({compania.porcentajeComision}%)
              </p>
              <p className="text-2xl font-bold text-green-700">$ {formatMoney(totalComision)}</p>
            </div>
          </div>

          {/* Tabla de pólizas */}
          {cargandoPolizas ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Cargando pólizas…</span>
            </div>
          ) : polizas.length === 0 ? (
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
                  {polizas.map((p: any) => {
                    const comision = (p.montoTotal ?? 0) * (compania.porcentajeComision / 100);
                    return (
                      <tr key={p.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-mono">{p.numeroPoliza || "—"}</td>
                        <td className="px-4 py-3">{TIPO_LABEL[p.tipoSeguro] ?? p.tipoSeguro}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {p.cliente?.nombre ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right">$ {formatMoney(p.montoTotal ?? 0)}</td>
                        <td className="px-4 py-3 text-right font-medium text-green-700">
                          $ {formatMoney(comision)}
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
