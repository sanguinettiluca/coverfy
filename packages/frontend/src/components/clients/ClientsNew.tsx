import { useForm } from "react-hook-form";
import api from "../../data/api"
import { toast } from "react-toastify";
import { Upload, FileCheck } from "lucide-react";
import { useState } from "react";
import PhoneInput from "./PhoneInput"

type ClienteForm = {
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

const ClientsNew = () => {
    const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<ClienteForm>();

    const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNombreArchivo(file.name);
            escanearCedula(file);
        }
    };
    const escanearCedula = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            console.log(formData.get("archivo"));
            const { data } = await api.post("ocr/reconocimiento", formData);

            if (data.firstName) {
                setValue("nombres", data.firstName);
            }

            if (data.lastName) {
                setValue("apellidos", data.lastName);
            }

            if (data.documentNumber) {
                setValue("documento", data.documentNumber);
            }

            if (data.dateOfBirth) {
                // Convierte DD/MM/YYYY a YYYY-MM-DD
                const [dia, mes, anio] = data.dateOfBirth.split("/");
                setValue("fechaNacimiento", `${anio}-${mes}-${dia}`);
            }

            toast.success("Datos extraídos correctamente");

        } catch (error: any) {
            if (error.response) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Error al escanear la cédula");
            }
        }
    };

    const onSubmit = (data: ClienteForm) => {
        console.log(data);
        api.post("/clientes", {
            firstName: data.nombres,
            lastName: data.apellidos,
            documentNumber: data.documento,
            dateOfBirth: data.fechaNacimiento ? new Date(data.fechaNacimiento).toISOString()
                : undefined,
            phone: data.celular,
            alternatePhone: data.celularAlternativo || undefined,
            email: data.email,
            address: data.direccion,
            notes: data.notas || undefined

        }).then(response => {
            toast.success(response.data.message);
            reset();
        }).catch(error => {
            if (error.response) {
                toast.error(error.response.data.message);
            } else {
                console.error("Error de conexión:", error.message);
            }
        });
    };

    return (
        <div className="page">
            <div className="login-card">

                <h1 className="login-title">Ingresa un nuevo cliente</h1>
                <p className="login-sub">Completa los detalles debajo</p>

                <form className="login-form" autoComplete="on" onSubmit={handleSubmit(onSubmit)}>

                    <label htmlFor="nombres">Nombres</label>
                    <input
                        id="nombres"
                        type="text"
                        {...register("nombres", { required: true })}
                    />
                    {errors.nombres && <span className="error">Este campo es requerido</span>}

                    <label htmlFor="apellidos">Apellidos</label>
                    <input
                        id="apellidos"
                        type="text"
                        {...register("apellidos", { required: true })}
                    />
                    {errors.apellidos && <span className="error">Este campo es requerido</span>}

                    <label htmlFor="documento">Documento</label>
                    <input
                        id="documento"
                        type="number"
                        placeholder="Cédula o documento de identidad"
                        {...register("documento", { required: true })}
                    />
                    {errors.documento && <span className="error">Este campo es requerido</span>}

                    <label htmlFor="cedula">Escanear cédula</label>

                    <div className="file-upload">
                        <input
                            id="cedula"
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="file-upload-input"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="cedula" className="file-upload-label">
                            {nombreArchivo ? <FileCheck size={16} /> : <Upload size={16} />}
                            {nombreArchivo ? "Cambiar archivo" : "Subir foto o PDF de la cédula"}
                        </label>
                        {nombreArchivo && (
                            <span className="file-upload-filename file-upload-filename--active">
                                {nombreArchivo}
                            </span>
                        )}
                    </div>

                    <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
                    <input
                        id="fechaNacimiento"
                        type="date"
                        placeholder="Opcional"
                        {...register("fechaNacimiento")}
                    />

                    <PhoneInput
                        control={control}
                        errors={errors}
                        name="celular"
                        label="Celular"
                        required
                    />

                    <PhoneInput
                        control={control}
                        errors={errors}
                        name="celularAlternativo"
                        label="Celular Alternativo"
                    />

                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        {...register("email", {
                            required: true,
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Ingresa una dirección de correo válida",
                            },
                        })}
                    />
                    {errors.email && (
                        <span className="error">
                            {errors.email.message || "Este campo es requerido"}
                        </span>
                    )}

                    <label htmlFor="direccion">Dirección</label>
                    <input
                        id="direccion"
                        type="text"
                        {...register("direccion", { required: true })}
                    />
                    {errors.direccion && <span className="error">Este campo es requerido</span>}

                    <label htmlFor="notas">Notas</label>
                    <textarea
                        id="notas"
                        className="notas-textarea"
                        placeholder="Opcional"
                        rows={3}
                        {...register("notas")}
                    />

                    <button type="submit" className="btn">
                        Crear cliente
                    </button>
                </form>

            </div>
        </div>
    );
};

export default ClientsNew;