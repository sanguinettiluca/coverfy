import { useState } from "react";
import type { FieldErrors } from "react-hook-form";
import SearchClientButton from "../clients/SearchClientButton"; // ajustá el path real

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

type Props = {
    setValue: (name: string, value: any, options?: any) => void;
    errors: FieldErrors<any>;
};

const ClientPicker = ({ setValue, errors }: Props) => {
    const [documento, setDocumento] = useState("");
    const [clienteEncontrado, setClienteEncontrado] = useState<Cliente | null>(null);

    const handleEncontrado = (cliente: Cliente) => {
        setClienteEncontrado(cliente);
        setValue("clienteId", cliente.id, { shouldValidate: true });
    };

    const handleNoEncontrado = () => {
        setClienteEncontrado(null);
        setValue("clienteId", "", { shouldValidate: true });
    };

    return (
        <>
            <label htmlFor="documento">Cédula del cliente</label>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                    id="documento"
                    type="text"
                    placeholder="Ingrese la cédula"
                    value={documento}
                    onChange={(e) => {
                        setDocumento(e.target.value);
                        if (clienteEncontrado) handleNoEncontrado();
                    }}
                />
                <SearchClientButton
                    documento={documento}
                    onEncontrado={handleEncontrado}
                    onNoEncontrado={handleNoEncontrado}
                />
            </div>

            {clienteEncontrado && (
                <p className="login-sub" style={{ marginTop: "-4px", marginBottom: 0 }}>
                    Cliente: {clienteEncontrado.nombres} {clienteEncontrado.apellidos}
                </p>
            )}

            {errors?.clienteId && (
                <span className="error">Debe buscar y seleccionar un cliente</span>
            )}
        </>
    );
};

export default ClientPicker;