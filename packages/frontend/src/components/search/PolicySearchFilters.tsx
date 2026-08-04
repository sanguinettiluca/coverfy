import type { PolicySortField, SortOrder, PolicyStatusFilter } from "./search.type";
import SubBrokerSelect from "./SubBrokerSelect";

type Props = {
    numeroPoliza: string;
    referencia: string;
    estado: PolicyStatusFilter;
    nombreCliente: string;
    subBrokerId: string;
    sortField: PolicySortField;
    sortOrder: SortOrder;
    onNumeroPolizaChange: (v: string) => void;
    onReferenciaChange: (v: string) => void;
    onEstadoChange: (v: PolicyStatusFilter) => void;
    onNombreClienteChange: (v: string) => void;
    onSubBrokerIdChange: (v: string) => void;
    onSortFieldChange: (v: PolicySortField) => void;
    onSortOrderChange: (v: SortOrder) => void;
};

const PolicySearchFilters = ({
    numeroPoliza,
    referencia,
    estado,
    nombreCliente,
    subBrokerId,
    sortField,
    sortOrder,
    onNumeroPolizaChange,
    onReferenciaChange,
    onEstadoChange,
    onNombreClienteChange,
    onSubBrokerIdChange,
    onSortFieldChange,
    onSortOrderChange,
}: Props) => {
    return (
        <div className="search-filters-row">
            <input
                type="text"
                placeholder="N° de póliza..."
                value={numeroPoliza}
                onChange={(e) => onNumeroPolizaChange(e.target.value)}
            />
            <input
                type="text"
                placeholder="N° de referencia..."
                value={referencia}
                onChange={(e) => onReferenciaChange(e.target.value)}
            />
            <select
                value={estado}
                onChange={(e) => onEstadoChange(e.target.value as PolicyStatusFilter)}
            >
                <option value="">Todos los estados</option>
                <option value="ACTIVE">Activa</option>
                <option value="EXPIRED">Vencida</option>
                <option value="CANCELLED">Cancelada</option>
                <option value="SUSPENDED">Suspendida</option>
            </select>
            <input
                type="text"
                placeholder="Nombre del cliente..."
                value={nombreCliente}
                onChange={(e) => onNombreClienteChange(e.target.value)}
            />
            <SubBrokerSelect value={subBrokerId} onChange={onSubBrokerIdChange} />
            <select
                value={sortField}
                onChange={(e) => onSortFieldChange(e.target.value as PolicySortField)}
            >
                <option value="policyNumber">Ordenar por N° póliza</option>
                <option value="expirationDate">Ordenar por vencimiento</option>
                <option value="totalAmount">Ordenar por monto</option>
                <option value="createdAt">Ordenar por fecha de alta</option>
            </select>
            <select
                value={sortOrder}
                onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}
            >
                <option value="asc">Ascendente</option>
                <option value="desc">Descendente</option>
            </select>
        </div>
    );
};

export default PolicySearchFilters;