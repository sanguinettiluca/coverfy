import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../data/api";
import CompanyEditForm from "./CompanyEditForm";
import CompanyCoveragesList from "./CompanyCoverageList";
import type { Company, CompanyForm } from "./companyEdit.types";

const CompanyEdit = () => {
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<CompanyForm>();

    const [companies, setCompanies] = useState<Company[]>([]);
    const [cargando, setCargando] = useState(true);

    const companyId = watch("companyId");
    const companiaSeleccionada = companies.find((c) => c.id === companyId);

    const cargarCompanias = () => {
        setCargando(true);
        api.get("/companias")
            .then((response) => setCompanies(response.data ?? []))
            .catch(() => setCompanies([]))
            .finally(() => setCargando(false));
    };

    useEffect(() => {
        cargarCompanias();
    }, []);

    const handleSeleccionar = (id: string) => {
        const company = companies.find((c) => c.id === id);
        if (company) {
            reset({
                companyId: company.id,
                name: company.name,
                commissionRate: company.commissionRate,
                url: company.url ?? "",
            });
        } else {
            reset({ companyId: "", name: "", commissionRate: undefined, url: "" });
        }
    };

    const handleCompaniaGuardada = () => {
        reset({ companyId: "", name: "", commissionRate: undefined, url: "" });
        cargarCompanias();
    };
    const handleCompaniaEliminada = () => {
        reset({ companyId: "", name: "", commissionRate: undefined, url: "" });
        cargarCompanias();
    };

    return (
        <div className="page">
            <div className="login-card">

                <h1 className="login-title">Editar Compañía</h1>
                <p className="login-sub">Elegí una compañía para editar sus datos y coberturas</p>

                <div className="login-form">
                    <label htmlFor="companyId">Compañía</label>
                    <select
                        id="companyId"
                        value={companyId ?? ""}
                        onChange={(e) => handleSeleccionar(e.target.value)}
                        disabled={cargando}
                    >
                        <option value="">
                            {cargando ? "Cargando compañías..." : "Elije una compañía..."}
                        </option>
                        {companies.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                {companiaSeleccionada && (
                    <>
                        <CompanyEditForm
                            register={register}
                            handleSubmit={handleSubmit}
                            errors={errors}
                            company={companiaSeleccionada}
                            onGuardado={handleCompaniaGuardada}
                            onEliminada={handleCompaniaEliminada}
                        />

                        <CompanyCoveragesList
                            coverages={companiaSeleccionada.coverages}
                            onCambio={cargarCompanias}
                        />
                    </>
                )}

            </div>
        </div>
    );
};

export default CompanyEdit;