import { Request, Response } from "express";
import { extractIdCardData } from "../services/ocr.service";

// 4>>>>>>2 toda la vida lloralo yoruga
export async function scanIdCardController(req: Request, res: Response): Promise<void> {
    try{
        const file = req.file as Express.Multer.File | undefined;

        if(!file){
            res.status(400).json({message: "No se recibio ningun archivo"});
            return;
        }

        const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
        if(!allowedTypes.includes(file.mimetype)){
            res.status(400).json({message: "Formato no soportado. Solo .JPEG, .PNG y .PDF"});
            return;
        }

        const data = await extractIdCardData(file.buffer, file.mimetype);
        res.status(200).json(data);
    }catch(error){
        if(error instanceof Error){
            res.status(500).json({message: error.message});
            return;
        }
        res.status(500).json({ message: "Error al procesar el documento" });
    }

}
