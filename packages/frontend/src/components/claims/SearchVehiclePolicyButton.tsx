import { Search } from "lucide-react";
import api from "../../data/api";
import { toast } from "react-toastify";
import type { ClaimPolicySummary } from "./claim.types";

type Props = {
    query: string;
    onFound: (policy: ClaimPolicySummary) => void;
    onNotFound: () => void;
};

const SearchVehiclePolicyButton = ({ query, onFound, onNotFound }: Props) => {

    const handleSearch = async () => {
        if (!query) {
            toast.error("Ingrese un número de póliza");
            return;
        }
        try {
            const response = await api.get("/polizas", {
                params: { search: query, status: "ACTIVE" }
            });

            const policies: ClaimPolicySummary[] = response.data.policies ?? [];
            const vehiclePolicy = policies.find(
                (p) => p.insuranceType === "VEHICLE" && p.policyNumber === query
            );

            if (!vehiclePolicy) {
                toast.error("No se encontró una póliza de vehículo activa con ese número");
                onNotFound();
                return;
            }

            toast.success("Póliza encontrada");
            onFound(vehiclePolicy);

        } catch (error) {
            toast.error("Error al buscar la póliza");
        }
    };

    return (
        <button type="button" className="sidebar-icon" onClick={handleSearch}>
            <Search size={18} />
        </button>
    );
};

export default SearchVehiclePolicyButton;