import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { obtenerCliente } from "@/services/clientes.service";
import api from "@/services/api";
import { NuevaPolizaForm } from "./NuevaPolizaForm";
import { PolizaDetalle } from "./PolizaDetalle";

interface ClienteDetalleProps {
  clienteId: string;
  onVolver: () => void;
}

interface Poliza {
  id: string;
  numeroPoliza: string;
  tipoSeguro: string;
  estado: string;
}

export function ClienteDetalle({ clienteId, onVolver }: ClienteDetalleProps) {
  const [mostrarFormPoliza, setMostrarFormPoliza] = useState(false);
  const [polizaSeleccionada, setPolizaSeleccionada] = useState<string | null>(null);

  const { data: cliente, isLoading } = useQuery({
    queryKey: ["cliente", clienteId],
    queryFn: () => obtenerCliente(clienteId),
  });

  const { data: polizas = [] } = useQuery({
    queryKey: ["polizas", clienteId],
    queryFn: async () => {
      const { data } = await api.get("/polizas", { params: { clienteId } });
      const lista: Poliza[] = data.polizas ?? data;
      return lista;
    },
  });

  if (isLoading || !cliente) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (polizaSeleccionada) {
    return (
      <PolizaDetalle
        polizaId={polizaSeleccionada}
        onVolver={() => setPolizaSeleccionada(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onVolver} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Volver
      </Button>

      {/* Datos del cliente */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h2 className="text-xl font-semibold">{cliente.nombres} {cliente.apellidos}</h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 text-sm">
          <Dato label="Documento" valor={cliente.documento} />
          <Dato label="Email" valor={cliente.email} />
          <Dato label="Celular" valor={cliente.celular} />
          <Dato label="Dirección" valor={cliente.direccion} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Pólizas</h3>
          <Button
            size="sm"
            className="gap-2 bg-primary text-primary-foreground"
            onClick={() => setMostrarFormPoliza(!mostrarFormPoliza)}
          >
            <Plus className="h-4 w-4" /> Nueva póliza
          </Button>
        </div>

        {mostrarFormPoliza && (
          <div className="mb-4">
            <NuevaPolizaForm
              clienteId={clienteId}
              onCreada={() => setMostrarFormPoliza(false)}
              onCancelar={() => setMostrarFormPoliza(false)}
            />
          </div>
        )}

        {polizas.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center border border-border rounded-lg">
            Este cliente no tiene pólizas.
          </p>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            {polizas.map((p) => (
              <button
                key={p.id}
                onClick={() => setPolizaSeleccionada(p.id)}
                className="w-full flex items-center justify-between px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 text-left transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{p.numeroPoliza}</p>
                  <p className="text-xs text-muted-foreground">{p.tipoSeguro}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">{p.estado}</span>
              </button>
            ))}
          </div>
        )}
      </div>
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