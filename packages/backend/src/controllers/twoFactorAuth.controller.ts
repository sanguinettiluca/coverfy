import { Request, Response } from "express"
import * as twoFactorAuthService from "../services/twoFactorAuth.service"

export async function setupController(req: Request, res: Response): Promise<void> {
    try {
        const { userId, email } = req.user!

        const result = await twoFactorAuthService.generateSetup(userId, email)

        res.status(200).json(result)
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
        const { code } = req.body

        const result = await twoFactorAuthService.confirmSetup(userId, code)

        res.status(200).json(result)
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
        const { password, code } = req.body

        await twoFactorAuthService.disable2FA(userId, password, code)

        res.status(200).json({ message: "2FA desactivado correctamente" })
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message })
            return
        }
        res.status(500).json({ message: "Error interno" })
    }
}
