import { Search } from "lucide-react";
import api from "../../data/api";
import { toast } from "react-toastify";

type Props = {
    documento: string;
    onEncontrado: (cliente: Cliente) => void;
    onNoEncontrado: () => void;
};

type Cliente = {
    id: string;
    nombres: string;
    apellidos: string;
    documento: string;
    fechaNacimiento?: string;
    celular: string;
    celularAlternativo?: string;
    email: string;
    direccion: string;
    notas?: string;
};

const SearchClientButton = ({ documento, onEncontrado, onNoEncontrado }: Props) => {

    const handleBuscar = async () => {
        
        if (!documento) {
            toast.error("Ingrese un documento");
            return;
        }
        try {
            const response = await api.get("/clientes", {
                params: {
                    busqueda: documento
                }
            });

            const clientes: Cliente[] = response.data.clientes;

            
            const cliente = clientes.find(
                c => c.documento.trim() === documento.trim()
            );
            if (!cliente) {
                
                toast.error("Cliente no encontrado");
                onNoEncontrado();
                return;
            }

            toast.success("Cliente encontrado");
            onEncontrado(cliente);

        } catch (error) {
            toast.error("Error al buscar cliente");
        }
    };


    return (
        <button type="button" className="sidebar-icon" onClick={handleBuscar}>
            <Search size={18} />
        </button>
    );
};

export default SearchClientButton;