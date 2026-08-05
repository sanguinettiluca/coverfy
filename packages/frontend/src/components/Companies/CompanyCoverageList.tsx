import CoverageRow from "./CovergeRow";
import type { Coverage } from "./companyEdit.types";

type Props = {
    coverages: Coverage[];
    onCambio: () => void;
};

const CompanyCoveragesList = ({ coverages, onCambio }: Props) => {
    return (
        <div className="claim-edit-form">
            <span className="claim-edit-select-label">
                Coberturas ({coverages.length})
            </span>

            {coverages.length === 0 && (
                <p className="dashboard-widget-empty">Esta compañía no tiene coberturas cargadas</p>
            )}

            {coverages.length > 0 && (
                <div className="dashboard-widget-list">
                    {coverages.map((cov) => (
                        <CoverageRow
                            key={cov.id}
                            cobertura={cov}
                            onActualizada={onCambio}
                            onEliminada={onCambio}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CompanyCoveragesList;