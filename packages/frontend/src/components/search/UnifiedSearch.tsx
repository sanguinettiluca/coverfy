import { useEffect, useState, useMemo } from "react";
import api from "../../data/api";
import SearchModeToggle from "./SearchModeToggle";
import ClientSearchFilters from "./ClientSearchFilters";
import PolicySearchFilters from "./PolicySearchFilters";
import ClientsResultsTable from "./ClientesResultsTable";
import PoliciesResultsTable from "./PoliciesResultsTable";
import SearchResultsPdfButton from "./SearchResultsPdf";
import type { Client, Policy, SearchMode, ClientSortField, PolicySortField, SortOrder, PolicyStatusFilter } from "./search.type";

const normalizar = (v: string) => v.trim().toLowerCase();

const UnifiedSearch = () => {
    const [mode, setMode] = useState<SearchMode>("clients");

    // --- Datos crudos traídos del backend ---
    const [clientesRaw, setClientesRaw] = useState<Client[]>([]);
    const [polizasRaw, setPolizasRaw] = useState<Policy[]>([]);
    const [cargando, setCargando] = useState(false);

    // --- Filtros clientes ---
    const [documento, setDocumento] = useState("");
    const [nombre, setNombre] = useState("");
    const [clientSort, setClientSort] = useState<ClientSortField>("name");
    const [clientOrder, setClientOrder] = useState<SortOrder>("asc");

    // --- Filtros pólizas ---
    const [numeroPoliza, setNumeroPoliza] = useState("");
    const [referencia, setReferencia] = useState("");
    const [estadoPoliza, setEstadoPoliza] = useState<PolicyStatusFilter>("");
    const [nombreCliente, setNombreCliente] = useState("");
    const [policySort, setPolicySort] = useState<PolicySortField>("createdAt");
    const [policyOrder, setPolicyOrder] = useState<SortOrder>("desc");

    // Trae un lote grande al cambiar de modo. El filtrado fino se hace
    // en el cliente (ver comentario sobre limitaciones de /polizas más abajo).
    useEffect(() => {
        setCargando(true);
        if (mode === "clients") {
            api.get("/clientes", { params: { perPage: 999999, page: 1 } })
                .then((response) => {
                    // Ajustá esta clave si tu backend devuelve "clientes" en vez de "clients"
                    setClientesRaw(response.data.clients ?? response.data.clientes ?? []);
                })
                .catch(() => setClientesRaw([]))
                .finally(() => setCargando(false));
        } else {
            api.get("/polizas", { params: { perPage: 999999, page: 1 } })
                .then((response) => {
                    setPolizasRaw(response.data.policies ?? []);
                })
                .catch(() => setPolizasRaw([]))
                .finally(() => setCargando(false));
        }
    }, [mode]);

    const clientesFiltrados = useMemo(() => {
        let resultado = clientesRaw;

        if (documento) {
            resultado = resultado.filter((c) => c.documentNumber.includes(documento.trim()));
        }
        if (nombre) {
            const q = normalizar(nombre);
            resultado = resultado.filter((c) =>
                normalizar(`${c.firstName} ${c.lastName}`).includes(q)
            );
        }

        const dir = clientOrder === "asc" ? 1 : -1;
        resultado = [...resultado].sort((a, b) => {
            if (clientSort === "name") {
                return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`) * dir;
            }
            if (clientSort === "document") {
                return a.documentNumber.localeCompare(b.documentNumber) * dir;
            }
            return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
        });

        return resultado;
    }, [clientesRaw, documento, nombre, clientSort, clientOrder]);

    const polizasFiltradas = useMemo(() => {
        let resultado = polizasRaw;

        if (numeroPoliza) {
            resultado = resultado.filter((p) =>
                normalizar(p.policyNumber).includes(normalizar(numeroPoliza))
            );
        }
        if (referencia) {
            resultado = resultado.filter((p) =>
                (p.referenceNumber ?? "").toLowerCase().includes(normalizar(referencia))
            );
        }
        if (estadoPoliza) {
            resultado = resultado.filter((p) => p.status === estadoPoliza);
        }
        if (nombreCliente) {
            const q = normalizar(nombreCliente);
            resultado = resultado.filter((p) =>
                p.client ? normalizar(`${p.client.firstName} ${p.client.lastName}`).includes(q) : false
            );
        }

        const dir = policyOrder === "asc" ? 1 : -1;
        resultado = [...resultado].sort((a, b) => {
            if (policySort === "policyNumber") {
                return a.policyNumber.localeCompare(b.policyNumber) * dir;
            }
            if (policySort === "expirationDate") {
                const fa = a.expirationDate ? new Date(a.expirationDate).getTime() : 0;
                const fb = b.expirationDate ? new Date(b.expirationDate).getTime() : 0;
                return (fa - fb) * dir;
            }
            if (policySort === "totalAmount") {
                return ((a.totalAmount ?? 0) - (b.totalAmount ?? 0)) * dir;
            }
            return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
        });

        return resultado;
    }, [polizasRaw, numeroPoliza, referencia, estadoPoliza, nombreCliente, policySort, policyOrder]);

    return (
        <div className="commissions-page">

            <div className="commissions-header">
                <h1 className="dashboard-title">Búsqueda General</h1>
                <p className="dashboard-sub">Buscá clientes o pólizas con filtros y orden personalizado.</p>
            </div>

            <SearchModeToggle mode={mode} onChange={setMode} />

            {mode === "clients" ? (
                <ClientSearchFilters
                    documento={documento}
                    nombre={nombre}
                    sortField={clientSort}
                    sortOrder={clientOrder}
                    onDocumentoChange={setDocumento}
                    onNombreChange={setNombre}
                    onSortFieldChange={setClientSort}
                    onSortOrderChange={setClientOrder}
                />
            ) : (
                <PolicySearchFilters
                    numeroPoliza={numeroPoliza}
                    referencia={referencia}
                    estado={estadoPoliza}
                    nombreCliente={nombreCliente}
                    sortField={policySort}
                    sortOrder={policyOrder}
                    onNumeroPolizaChange={setNumeroPoliza}
                    onReferenciaChange={setReferencia}
                    onEstadoChange={setEstadoPoliza}
                    onNombreClienteChange={setNombreCliente}
                    onSortFieldChange={setPolicySort}
                    onSortOrderChange={setPolicyOrder}
                />
            )}

            <div className="search-results-header">
                <span className="dashboard-widget-item-sub">
                    {cargando
                        ? "Cargando..."
                        : mode === "clients"
                            ? `${clientesFiltrados.length} cliente(s) encontrado(s)`
                            : `${polizasFiltradas.length} póliza(s) encontrada(s)`}
                </span>
                <SearchResultsPdfButton mode={mode} clientes={clientesFiltrados} polizas={polizasFiltradas} />
            </div>

            {cargando ? (
                <p className="dashboard-widget-loading">Cargando resultados...</p>
            ) : mode === "clients" ? (
                <ClientsResultsTable clientes={clientesFiltrados} />
            ) : (
                <PoliciesResultsTable polizas={polizasFiltradas} />
            )}

        </div>
    );
};

export default UnifiedSearch;