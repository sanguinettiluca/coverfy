import { describe, it, expect, afterAll } from "vitest"
import { generate } from "otplib"
import { api, createRegistry, cleanupRegistry, createBroker, CreatedUser } from "./helpers"

// ===========================================================================
// SECCION 5 - 2FA: ciclo completo repetido x10 con codigos TOTP generados
// programaticamente (otplib, la MISMA libreria que usa el backend), y
// agotamiento de los 8 backup codes de un usuario.
// ===========================================================================

const CYCLES = 10

describe("2FA: ciclo completo (setup -> confirm -> login en dos pasos -> logout) x10", () => {
    const reg = createRegistry()
    afterAll(async () => {
        await cleanupRegistry(reg)
    })

    for (let i = 0; i < CYCLES; i++) {
        it(`ciclo #${i + 1}: usuario nuevo completa el flujo de punta a punta`, async () => {
            const user = await createBroker(reg, { name: `2FA Cycle ${i}` })

            // 1) Login normal (todavia sin 2FA) para obtener un accessToken real
            const firstLogin = await api.post("/api/auth/login").send({ email: user.email, password: user.password })
            expect(firstLogin.status).toBe(200)
            expect(firstLogin.body.accessToken).toBeTruthy()
            const initialToken = firstLogin.body.accessToken as string

            // 2) Setup: pide el secret TOTP
            const setupRes = await api.post("/api/auth/2fa/setup").set({ Authorization: `Bearer ${initialToken}` })
            expect(setupRes.status).toBe(200)
            const secret = setupRes.body.secret as string
            expect(secret).toBeTruthy()

            // 3) Confirm: genera el codigo TOTP valido con la MISMA libreria (otplib)
            //    que usa src/services/twoFactor.service.ts, no un codigo hardcodeado.
            const confirmCode = await generate({ secret })
            const confirmRes = await api
                .post("/api/auth/2fa/confirm")
                .set({ Authorization: `Bearer ${initialToken}` })
                .send({ code: confirmCode })
            expect(confirmRes.status).toBe(200)
            expect(confirmRes.body.backupCodes).toHaveLength(8)

            // 4) Login en dos pasos: ahora el login normal debe cortar en 2FA pendiente
            const secondLogin = await api.post("/api/auth/login").send({ email: user.email, password: user.password })
            expect(secondLogin.status).toBe(200)
            expect(secondLogin.body.twoFactorRequired).toBe(true)
            const preAuthToken = secondLogin.body.preAuthToken as string

            const loginCode = await generate({ secret })
            const verifyRes = await api.post("/api/auth/login/verify-2fa").send({ preAuthToken, code: loginCode })
            expect(verifyRes.status).toBe(200)
            const finalToken = verifyRes.body.accessToken as string
            expect(finalToken).toBeTruthy()

            // El endpoint protegido responde con el token final
            const me = await api.get("/api/auth/me").set({ Authorization: `Bearer ${finalToken}` })
            expect(me.status).toBe(200)

            // 5) Logout: invalida el token (queda en la blacklist)
            const logoutRes = await api.post("/api/auth/logout").set({ Authorization: `Bearer ${finalToken}` })
            expect(logoutRes.status).toBe(200)

            const afterLogout = await api.get("/api/auth/me").set({ Authorization: `Bearer ${finalToken}` })
            expect(afterLogout.status).toBe(401)
        })
    }
})

describe("2FA: agotamiento de los 8 backup codes", () => {
    const reg = createRegistry()
    afterAll(async () => {
        await cleanupRegistry(reg)
    })

    it("cada backup code se invalida al usarse, y el 9no intento (reusar uno ya usado) siempre falla", async () => {
        const user = await createBroker(reg, { name: "2FA Backup Codes" })

        const login = await api.post("/api/auth/login").send({ email: user.email, password: user.password })
        const initialToken = login.body.accessToken as string

        const setupRes = await api.post("/api/auth/2fa/setup").set({ Authorization: `Bearer ${initialToken}` })
        const secret = setupRes.body.secret as string
        const confirmCode = await generate({ secret })
        const confirmRes = await api.post("/api/auth/2fa/confirm").set({ Authorization: `Bearer ${initialToken}` }).send({ code: confirmCode })
        const backupCodes: string[] = confirmRes.body.backupCodes
        expect(backupCodes).toHaveLength(8)

        // preAuthToken (JWT de 5 min, sin estado) se puede reutilizar para varios
        // intentos de verify-2fa dentro de su ventana de validez.
        const secondLogin = await api.post("/api/auth/login").send({ email: user.email, password: user.password })
        const preAuthToken = secondLogin.body.preAuthToken as string

        const usedCodes: string[] = []
        for (const code of backupCodes) {
            const res = await api.post("/api/auth/login/verify-2fa").send({ preAuthToken, code })
            expect(res.status).toBe(200)
            usedCodes.push(code)

            // Reintentar el MISMO codigo inmediatamente despues de usarlo debe fallar:
            // ya fue invalidado (removido de twoFactorBackupCodes) en esta misma llamada.
            const reuseImmediately = await api.post("/api/auth/login/verify-2fa").send({ preAuthToken, code })
            expect(reuseImmediately.status).toBe(401)
        }

        expect(usedCodes).toHaveLength(8)

        // 9no intento: reusar cualquiera de los 8 ya usados falla siempre
        for (const code of backupCodes) {
            const res = await api.post("/api/auth/login/verify-2fa").send({ preAuthToken, code })
            expect(res.status).toBe(401)
        }
    })
})
