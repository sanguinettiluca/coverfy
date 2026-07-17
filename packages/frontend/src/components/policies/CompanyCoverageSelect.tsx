import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import type { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from "react-hook-form";
import api from "../../data/api"; 

type TipoSeguro =
    | "VEHICULO"
    | "VIAJE"
    | "ALQUILER"
    | "HOGAR"
    | "COMERCIO"
    | "RESPONSABILIDAD_CIVIL"
    | "FIANZA"
    | "VIDA"
    | "OTROS";

type Cobertura = {
    id: string;
    nombre: string;
    companiaId: string;
    tipoSeguro: TipoSeguro;
};

type Compania = {
    id: string;
    nombre: string;
    porcentajeComision: number;
    brokerId: string;
    createdAt: string;
    coberturas: Cobertura[];
};

type PolizaFormFields = {
    companiaId: string;
    coberturaId?: string;
    tipoSeguro: TipoSeguro | "";
};

type Props<T extends PolizaFormFields> = {
    register: UseFormRegister<T>;
    watch: UseFormWatch<T>;
    setValue: UseFormSetValue<T>;
    errors: FieldErrors<T>;
};

const CompanyCoverageSelect = <T extends PolizaFormFields>({
    register,
    watch,
    setValue,
    errors,
}: Props<T>) => {
    const [companias, setCompanias] = useState<Compania[]>([]);
    const [cargando, setCargando] = useState(true);

    const companiaId = watch("companiaId" as any);
    const tipoSeguro = watch("tipoSeguro" as any);

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

    const companiaSeleccionada = companias.find((c) => c.id === companiaId);

    const coberturasDisponibles = (companiaSeleccionada?.coberturas ?? []).filter(
        (cobertura) => !tipoSeguro || cobertura.tipoSeguro === tipoSeguro
    );

    const handleCompaniaChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setValue("companiaId" as any, e.target.value as any, { shouldValidate: true });
        setValue("coberturaId" as any, "" as any);
    };

    return (
        <>
            <label htmlFor="companiaId">Compañía</label>
            <select
                id="companiaId"
                value={companiaId ?? ""}
                onChange={handleCompaniaChange}
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

            <label htmlFor="coberturaId">Cobertura</label>
            <select
                id="coberturaId"
                {...register("coberturaId" as any)}
                disabled={!companiaId || coberturasDisponibles.length === 0}
            >
                <option value="">
                    {!companiaId
                        ? "Elije primero una compañía..."
                        : coberturasDisponibles.length === 0
                            ? "Sin coberturas disponibles"
                            : "Elije una cobertura..."}
                </option>
                {coberturasDisponibles.map((cobertura) => (
                    <option key={cobertura.id} value={cobertura.id}>
                        {cobertura.nombre}
                    </option>
                ))}
            </select>
        </>
    );
};

export default CompanyCoverageSelect;