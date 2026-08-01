import { useEffect, useState } from "react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import api from "../../data/api";
import type { CoverageForm } from "../coverages/CoverageTypes";

type Company = {
    id: string;
    name: string;
    commissionRate: number;
    brokerId: string;
    createdAt: string;
};

type Props = {
    register: UseFormRegister<CoverageForm>;
    errors: FieldErrors<CoverageForm>;
};

const CompanySelect = ({ register, errors }: Props) => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get("/companias")
            .then((response) => {
                setCompanies(response.data);
            })
            .catch(() => {
                setCompanies([]);
            })
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <>
            <label htmlFor="companyId">Compañía</label>
            <select
                id="companyId"
                {...register("companyId", { required: true })}
                disabled={isLoading}
            >
                <option value="">
                    {isLoading ? "Cargando compañías..." : "Elije una compañía..."}
                </option>
                {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                        {company.name}
                    </option>
                ))}
            </select>
            {errors.companyId && <span className="error">Este campo es requerido</span>}
        </>
    );
};

export default CompanySelect;