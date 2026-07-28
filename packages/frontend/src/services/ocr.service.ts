import api from "./api";

export interface IdCardData{
    firstName?: string;
    lastName?: string;
    documentNumber?: string;
    dateOfBirth?: string;
}

export async function scanIdCard(file: File): Promise<IdCardData>{
    const formData = new FormData();
    formData.append("file", file);

    const {data} = await api.post<IdCardData>("/ocr/cedula", formData, {
        headers: {"Content-Type": "multipart/form-data"},
    });

    return data;
}
