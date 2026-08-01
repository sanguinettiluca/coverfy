import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import type { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from "react-hook-form";
import api from "../../data/api";

type InsuranceType =
    | "VEHICLE"
    | "TRIP"
    | "RENTAL"
    | "HOME"
    | "BUSINESS"
    | "LIABILITY"
    | "BOND"
    | "LIFE"
    | "OTHER";

type Coverage = {
    id: string;
    name: string;
    companyId: string;
    insuranceType: InsuranceType;
};

type Company = {
    id: string;
    name: string;
    commissionRate: number;
    brokerId: string;
    createdAt: string;
    coverages: Coverage[];
};

type PolizaFormFields = {
    companiaId: string;
    coberturaId?: string;
    tipoSeguro: InsuranceType | "";
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
    const [companias, setCompanias] = useState<Company[]>([]);
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

    const coberturasDisponibles = (companiaSeleccionada?.coverages ?? []).filter(
        (cobertura) => !tipoSeguro || cobertura.insuranceType === tipoSeguro
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
                        {compania.name}
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
                        {cobertura.name}
                    </option>
                ))}
            </select>
        </>
    );
};

export default CompanyCoverageSelect;