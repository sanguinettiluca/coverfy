import { useEffect } from "react";
import { Search } from "lucide-react";
import api from "../../data/api";
import { toast } from "react-toastify";

type Props = {
    documento: string;
    onEncontrado: (cliente: Client) => void;
    onNoEncontrado: () => void;
    autoTrigger?: number;
};

type Client = {
    id: string;
    firstName: string;
    lastName: string;
    documentNumber: string;
    dateOfBirth?: string;
    phone: string;
    alternatePhone?: string;
    email: string;
    address: string;
    notes?: string;
    isActive?: boolean;
};

const SearchClientButton = ({ documento, onEncontrado, onNoEncontrado, autoTrigger }: Props) => {

    const handleBuscar = async () => {
        if (!documento) {
            toast.error("Ingrese un documento");
            return;
        }
        try {
            const response = await api.get(`/clientes/documento/${documento.trim()}`);

            toast.success("Cliente encontrado");
            onEncontrado(response.data);

        } catch (error) {
            toast.error("Cliente no encontrado");
            onNoEncontrado();
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

export default SearchClientButton;