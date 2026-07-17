import { useEffect, useState } from "react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import api from "../../data/api"; // ajustá el path real

type Compania = {
    id: string;
    nombre: string;
    porcentajeComision: number;
    brokerId: string;
    createdAt: string;
};

type CompaniaFormFields = {
    companiaId: string;
    [key: string]: any;
};

type Props = {
    register: UseFormRegister<CompaniaFormFields>;
    errors: FieldErrors<CompaniaFormFields>;
};

const CompanySelect = ({ register, errors }: Props) => {
    const [companias, setCompanias] = useState<Compania[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        api.get("/companias")
            .then((response) => {
                setCompanias(response.data);
            })
            .catch(() => {
                setCompanias([]);
            })
            .finally(() => setCargando(false));
    }, []);

    return (
        <>
            <label htmlFor="companiaId">Compañía</label>
            <select
                id="companiaId"
                {...register("companiaId", { required: true })}
                disabled={cargando}
            >
                <option value="">
                    {cargando ? "Cargando compañías..." : "Elije una compañía..."}
                </option>
                {companias.map((compania) => (
                    <option key={compania.id} value={compania.id}>
                        {compania.nombre}
                    </option>
                ))}
            </select>
            {errors.companiaId && <span className="error">Este campo es requerido</span>}
        </>
    );
};

export default CompanySelect;