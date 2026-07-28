import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getClient } from "@/services/clients.service";
import api from "@/services/api";
import { NewPolicyForm } from "./NewPolicyForm";
import { PolicyDetail } from "./PolicyDetail";
import { useDebounce } from "@/hooks/useDebounce";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listCompanies } from "@/services/companies.service";

interface ClientDetailProps {
  clientId: string;
  onBack: () => void;
}

interface Policy {
  id: string;
  policyNumber: string;
  insuranceType: string;
  status: string;
}

export function ClientDetail({ clientId, onBack }: ClientDetailProps) {
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
  const [policySearch, setPolicySearch] = useState("");
  const policySearchDebounced = useDebounce(policySearch);
  const [companyFilter, setCompanyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: client, isLoading } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => getClient(clientId),
  });

  const { data: policies = [] } = useQuery({
    queryKey: ["policies", clientId, policySearchDebounced, companyFilter, statusFilter],
    queryFn: async () => {
      const { data } = await api.get("/polizas", {
      params: {
        clientId,
        search: policySearchDebounced || undefined,
        companyId: companyFilter || undefined,
        status: statusFilter || undefined,
      },
      });
      const list: Policy[] = data.policies ?? data;
      return list;
    },
  });

  const {data: companies = []} = useQuery({
    queryKey: ["companies"],
    queryFn: listCompanies,
  });

  if (isLoading || !client) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (selectedPolicy) {
    return (
      <PolicyDetail
        policyId={selectedPolicy}
        onBack={() => setSelectedPolicy(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Volver
      </Button>

      {/* Datos del cliente */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h2 className="text-xl font-semibold">{client.firstName} {client.lastName}</h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 text-sm">
          <DataItem label="Documento" value={client.documentNumber} />
          <DataItem label="Email" value={client.email} />
          <DataItem label="Celular" value={client.phone} />
          <DataItem label="Dirección" value={client.address} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Pólizas</h3>
          <Button
            size="sm"
            className="gap-2 bg-primary text-primary-foreground"
            onClick={() => setShowPolicyForm(!showPolicyForm)}
          >
            <Plus className="h-4 w-4" /> Nueva póliza
          </Button>
        </div>

        {/* Listado de pólizas con buscador y filtros: */}

        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número de póliza o matrícula..."
              className="pl-9 h-9 text-sm"
              value={policySearch}
              onChange={(e) => setPolicySearch(e.target.value)}
            />
          </div>

          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Todas las compañías</option>
            {companies.map((c)=>(
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Todos los estados</option>
              <option value="ACTIVE">Activas</option>
              <option value="EXPIRED">Vencidas</option>
              <option value="CANCELLED">Canceladas</option>
              <option value="SUSPENDED">Suspendidas</option>
            </select>

        </div>

        {showPolicyForm && (
          <div className="mb-4">
            <NewPolicyForm
              clientId={clientId}
              onCreated={() => setShowPolicyForm(false)}
              onCancel={() => setShowPolicyForm(false)}
            />
          </div>
        )}

        {policies.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center border border-border rounded-lg">
            Este cliente no tiene pólizas.
          </p>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            {policies.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPolicy(p.id)}
                className="w-full flex items-center justify-between px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 text-left transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{p.policyNumber}</p>
                  <p className="text-xs text-muted-foreground">{p.insuranceType}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">{p.status}</span>
              </button>
            ))}
          </div>
        )}
      </div>
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
