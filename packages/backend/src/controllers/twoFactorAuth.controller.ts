import { Request, Response } from "express"
import * as twoFactorAuthService from "../services/twoFactorAuth.service"

export async function setupController(req: Request, res: Response): Promise<void> {
    try {
        const { userId, email } = req.user!

        const resultado = await twoFactorAuthService.generarSetup(userId, email)

        res.status(200).json(resultado)
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message })
            return
        }
        res.status(500).json({ message: "Error interno" })
    }
}

export async function confirmController(req: Request, res: Response): Promise<void> {
    try {
        const { userId } = req.user!
        const { codigo } = req.body

        const resultado = await twoFactorAuthService.confirmarSetup(userId, codigo)

        res.status(200).json(resultado)
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message })
            return
        }
        res.status(500).json({ message: "Error interno" })
    }
}

export async function disableController(req: Request, res: Response): Promise<void> {
    try {
        const { userId } = req.user!
        const { password, codigo } = req.body

        await twoFactorAuthService.desactivar2FA(userId, password, codigo)

        res.status(200).json({ message: "2FA desactivado correctamente" })
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message })
            return
        }
        res.status(500).json({ message: "Error interno" })
    }
}