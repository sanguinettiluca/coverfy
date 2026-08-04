import { useEffect, useState } from "react";
import api from "../../data/api"; 
import type { SubBroker } from "./search.type";

type Props = {
    value: string;
    onChange: (subBrokerId: string) => void;
};

const SubBrokerSelect = ({ value, onChange }: Props) => {
    const [subBrokers, setSubBrokers] = useState<SubBroker[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        api.get("/auth/sub-brokers")
            .then((response) => setSubBrokers(response.data ?? []))
            .catch(() => setSubBrokers([]))
            .finally(() => setCargando(false));
    }, []);

    return (
        <select value={value} onChange={(e) => onChange(e.target.value)} disabled={cargando}>
            <option value="">
                {cargando ? "Cargando sub-brokers..." : "Todos los sub-brokers"}
            </option>
            {subBrokers.map((sb) => (
                <option key={sb.id} value={sb.id}>
                    {sb.name}
                </option>
            ))}
        </select>
    );
};

export default SubBrokerSelect;