import { useEffect, useState } from "react";
import api from "../data/api";
import { toast } from "react-toastify";

type Broker = {
    id: string;
    nombre: string;
};

type BrokerSelectProps = {
    id?: string;
    value?: string;
    onChange: (brokerId: string) => void;
};

const BrokerSelect = ({ id, value, onChange }: BrokerSelectProps) => {
    const [brokers, setBrokers] = useState<Broker[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        api.get("/users", { params: { role: "BROKER" } })
            .then((response) => {
                setBrokers(response.data.users);
            })
            .catch(() => {
                toast.error("No se pudo cargar la lista de brokers");
            })
            .finally(() => setCargando(false));
    }, []);

    return (
        <select
            id={id}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={cargando}
        >
            <option value="">
                {cargando ? "Cargando brokers..." : "Elije un broker..."}
            </option>
            {brokers.map((broker) => (
                <option key={broker.id} value={broker.id}>
                    {broker.nombre}
                </option>
            ))}
        </select>
    );
};

export default BrokerSelect;