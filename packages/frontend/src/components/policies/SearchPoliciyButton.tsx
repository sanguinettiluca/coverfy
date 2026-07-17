import { Search } from "lucide-react";
import api from "../../data/api";
import { toast } from "react-toastify";

type PolizaResumen = {
    id: string;
    numeroPoliza: string;
    numeroReferencia?: string | null;
};

type Props = {
    numeroReferencia: string;
    onEncontrado: (polizaId: string) => void;
    onNoEncontrado: () => void;
};

const SearchPolicyButton = ({ numeroReferencia, onEncontrado, onNoEncontrado }: Props) => {

    const handleBuscar = async () => {
        if (!numeroReferencia) {
            toast.error("Ingrese un número de referencia");
            return;
        }
        try {
            const response = await api.get("/polizas", {
                params: {
                    busqueda: numeroReferencia
                }
            });

            const polizas: PolizaResumen[] = response.data.polizas;

            const poliza = polizas.find(
                (p) => p.numeroReferencia === numeroReferencia
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

    return (
        <button type="button" className="sidebar-icon" onClick={handleBuscar}>
            <Search size={18} />
        </button>
    );
};

export default SearchPolicyButton;