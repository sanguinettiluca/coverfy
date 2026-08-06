import { recognizeIdCard, recognizePolicyDocument } from "../services/gemini.service";
import { Request, Response } from "express"

export async function scanIdCard(req: Request, res: Response): Promise<void> {

    try{
        if (!req.file) {
            res.status(400).json({ message: "No se envió ningún archivo" })
            return
        }

        const data = await recognizeIdCard(
            req.file?.buffer,
            req.file?.mimetype
        );

        res.status(200).json(data)
    }catch(error){
        console.error("ERROR GEMINI:", error)
        res.status(500).json({
            message: "Error reconociendo la cedula"
        })
    }
}

export async function scanPolicyDocument(req: Request, res: Response): Promise<void> {
    try{
        if (!req.file) {
            res.status(400).json({ message: "No se envió ningún archivo" })
            return
        }

        if (req.file.mimetype !== "application/pdf") {
            res.status(400).json({ message: "El archivo debe ser un PDF" })
            return
        }

        const data = await recognizePolicyDocument(req.file.buffer);

        res.status(200).json(data)
    }catch(error){
        console.error("ERROR GEMINI POLIZA:", error)
        res.status(500).json({
            message: "Error reconociendo el documento"
        })
    }
}