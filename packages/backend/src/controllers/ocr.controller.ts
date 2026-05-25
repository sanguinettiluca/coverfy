import { Request, Response } from "express";
import { extraerDatosCedula } from "../services/ocr.service";

// 4>>>>>>2 toda la vida lloralo yoruga
export async function escanearCedulaController(req: Request, res: Response): Promise<void> {
    try{
        const archivo = req.file as Express.Multer.File | undefined;

        if(!archivo){
            res.status(400).json({message: "No se recibio ningun archivo"});
            return;
        }

        const tiposPermitidos = ["image/jpeg", "image/png", "application/pdf"];
        if(!tiposPermitidos.includes(archivo.mimetype)){
            res.status(400).json({message: "Formato no soportado. Solo .JPEG, .PNG y .PDF"});
            return;
        }

        const datos = await extraerDatosCedula(archivo.buffer, archivo.mimetype);
        res.status(200).json(datos);
    }catch(error){
        if(error instanceof Error){
            res.status(500).json({message: error.message});
            return;
        }
        res.status(500).json({ message: "Error al procesar el documento" });
    }
    
}