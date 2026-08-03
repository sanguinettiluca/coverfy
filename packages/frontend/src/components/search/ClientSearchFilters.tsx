import type { ClientSortField, SortOrder } from "./search.type";

type Props = {
    documento: string;
    nombre: string;
    sortField: ClientSortField;
    sortOrder: SortOrder;
    onDocumentoChange: (v: string) => void;
    onNombreChange: (v: string) => void;
    onSortFieldChange: (v: ClientSortField) => void;
    onSortOrderChange: (v: SortOrder) => void;
};

const ClientSearchFilters = ({
    documento, nombre, sortField, sortOrder,
    onDocumentoChange, onNombreChange, onSortFieldChange, onSortOrderChange,
}: Props) => (
    <div className="search-filters-row">
        <input
            type="text"
            placeholder="Buscar por cédula..."
            value={documento}
            onChange={(e) => onDocumentoChange(e.target.value)}
        />
        <input
            type="text"
            placeholder="Buscar por nombre..."
            value={nombre}
            onChange={(e) => onNombreChange(e.target.value)}
        />
        <select value={sortField} onChange={(e) => onSortFieldChange(e.target.value as ClientSortField)}>
            <option value="name">Ordenar por nombre</option>
            <option value="document">Ordenar por cédula</option>
            <option value="createdAt">Ordenar por fecha de alta</option>
        </select>
        <select value={sortOrder} onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}>
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
        </select>
    </div>
);

export default ClientSearchFilters;