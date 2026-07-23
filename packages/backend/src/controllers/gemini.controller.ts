import { reconocerCedula } from "../services/gemini.service";
import { Request, Response } from "express"

export async function scanCedula(req: Request, res: Response): Promise<void> {

    try{
        if (!req.file) {
            res.status(400).json({ message: "No se envió ningún archivo" })
            return
        }

        const datos = await reconocerCedula(
            req.file?.buffer,
            req.file?.mimetype
        );

        res.status(200).json(datos)
    }catch(error){
        console.error("ERROR GEMINI:", error)
        res.status(500).json({
            message: "Error reconociendo la cedula"
        })
    }
}