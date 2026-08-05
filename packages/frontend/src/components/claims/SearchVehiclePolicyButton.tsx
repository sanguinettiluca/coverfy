import { Search } from "lucide-react";
import api from "../../data/api";
import { toast } from "react-toastify";
import type { ClaimPolicySummary } from "./claim.types";

type Props = {
    referencia: string;
    onEncontrado: (policy: ClaimPolicySummary) => void;
    onNoEncontrado: () => void;
};

const SearchVehiclePolicyButton = ({ referencia, onEncontrado, onNoEncontrado }: Props) => {

    const handleBuscar = async () => {
        if (!referencia) {
            toast.error("Ingrese un número de referencia");
            return;
        }
        try {
            const response = await api.get("/polizas", {
                params: { search: referencia, status: "ACTIVE" }
            });

            const policies: ClaimPolicySummary[] = response.data.policies ?? [];
            const vehiclePolicy = policies.find(
                (p) => p.insuranceType === "VEHICLE" && p.referenceNumber === referencia
            );

            if (!vehiclePolicy) {
                toast.error("No se encontró una póliza de vehículo activa con ese número de referencia");
                onNoEncontrado();
                return;
            }

            toast.success("Póliza encontrada");
            onEncontrado(vehiclePolicy);

        } catch (error) {
            toast.error("Error al buscar la póliza");
        }
    };

    return (
        <button type="button" className="sidebar-icon" onClick={handleBuscar}>
            <Search size={18} />
        </button>
    );
};

export default SearchVehiclePolicyButton;