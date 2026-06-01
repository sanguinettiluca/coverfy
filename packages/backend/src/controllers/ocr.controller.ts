import { Request, Response } from 'express';
import { ocrService } from '../services/ocr.service';

export async function ocrController(req: Request, res: Response) {
  try {
    const imagen = (req as any).file as any;
    if (!imagen || !imagen.buffer) {
      return res.status(400).json({ error: 'Se requiere una imagen para procesar sus datos' });
    }

    const permitidos = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!permitidos.includes(imagen.mimetype)) {
      return res.status(400).json({ error: 'Archivo no permitido. Solo se aceptan JPEG, PNG o PDF' });
    }

    const datos = await ocrService(imagen.buffer, imagen.mimetype);
    res.status(200).json({ datos });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error desconocido' });
  }
}
