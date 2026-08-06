import { Search } from "lucide-react";
import api from "../../data/api";
import { toast } from "react-toastify";
import type { Claim } from "./claim.types";

type Props = {
    query: string;
    onFound: (claims: Claim[]) => void;
    onNotFound: () => void;
};

const SearchClaimButton = ({ query, onFound, onNotFound }: Props) => {

    const handleSearch = async () => {
        if (!query) {
            toast.error("Ingrese un número de póliza");
            return;
        }
        try {
            const response = await api.get("/siniestros", {
                params: { search: query, perPage: 1000, page: 1 }
            });

            const claims: Claim[] = response.data.claims ?? [];
            const filtered = claims.filter((c) => c.policy.policyNumber === query);

            if (filtered.length === 0) {
                toast.error("No se encontraron siniestros");
                onNotFound();
                return;
            }

            toast.success(
                filtered.length === 1
                    ? "Siniestro encontrado"
                    : `${filtered.length} siniestros encontrados`
            );
            onFound(filtered);

        } catch (error) {
            toast.error("Error al buscar siniestros");
        }
    };

    return (
        <button type="button" className="sidebar-icon" onClick={handleSearch}>
            <Search size={18} />
        </button>
    );
};

export default SearchClaimButton;