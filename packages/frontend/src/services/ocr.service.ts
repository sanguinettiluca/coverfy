import api from "./api";

export interface DatosCedula{
    nombres?: string;
    apellidos?: string;
    documento?: string;
    fechaNacimiento?: string;
}

export async function escanearCedula(archivo: File): Promise<DatosCedula>{
    const formData = new FormData();
    formData.append("archivo", archivo);

    const {data} = await api.post<DatosCedula>("/ocr/cedula", formData, {
        headers: {"Content-Type": "multipart/form-data"},
    });

    return data;
}