import { Search } from "lucide-react";
import api from "../../data/api";
import { toast } from "react-toastify";
import type { Claim } from "./claim.types";

type Props = {
    busqueda: string;
    onEncontrados: (claims: Claim[]) => void;
    onNoEncontrados: () => void;
};

const SearchClaimButton = ({ busqueda, onEncontrados, onNoEncontrados }: Props) => {

    const handleBuscar = async () => {
        if (!busqueda) {
            toast.error("Ingrese un dato para buscar");
            return;
        }
        try {
            const response = await api.get("/siniestros", {
                params: { search: busqueda, perPage: 1000, page: 1 }
            });

            const claims: Claim[] = response.data.claims ?? [];

            if (claims.length === 0) {
                toast.error("No se encontraron siniestros");
                onNoEncontrados();
                return;
            }

            toast.success(
                claims.length === 1
                    ? "Siniestro encontrado"
                    : `${claims.length} siniestros encontrados`
            );
            onEncontrados(claims);

        } catch (error) {
            toast.error("Error al buscar siniestros");
        }
    };

    return (
        <button type="button" className="sidebar-icon" onClick={handleBuscar}>
            <Search size={18} />
        </button>
    );
};

export default SearchClaimButton;