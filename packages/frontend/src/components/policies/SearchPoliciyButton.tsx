import { useEffect } from "react";
import { Search } from "lucide-react";
import api from "../../data/api";
import { toast } from "react-toastify";

type PolizaResumen = {
    id: string;
    policyNumber: string;
    referenceNumber?: string | null;
};

type Props = {
    numeroReferencia: string;
    onEncontrado: (polizaId: string) => void;
    onNoEncontrado: () => void;
    autoTrigger?: number; // cuando cambia, dispara la búsqueda automáticamente
};

const SearchPolicyButton = ({ numeroReferencia, onEncontrado, onNoEncontrado, autoTrigger }: Props) => {

    const handleBuscar = async () => {
        if (!numeroReferencia) {
            toast.error("Ingrese un número de referencia");
            return;
        }
        try {
            const response = await api.get("/polizas", {
                params: {
                    search: numeroReferencia
                }
            });

            const polizas: PolizaResumen[] = response.data.policies;

            const poliza = polizas.find(
                (p) => p.referenceNumber === numeroReferencia
            );

            if (!poliza) {
                toast.error("Póliza no encontrada");
                onNoEncontrado();
                return;
            }

            toast.success("Póliza encontrada");
            onEncontrado(poliza.id);

        } catch (error) {
            toast.error("Error al buscar póliza");
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (autoTrigger !== undefined && autoTrigger > 0) {
            handleBuscar();
        }
    }, [autoTrigger]);

    return (
        <button type="button" className="sidebar-icon" onClick={handleBuscar}>
            <Search size={18} />
        </button>
    );
};

export default SearchPolicyButton;