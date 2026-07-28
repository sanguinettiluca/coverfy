import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { generate } from 'otplib'
import { app, prisma, resetDatabase, createUserDirect, loginAs, TEST_PASSWORD } from './helpers'
import { decrypt } from '../src/utils/crypto.util'

describe('auth', () => {
  beforeEach(async () => {
    await resetDatabase()
  })

  it('lets an admin create a broker, and the broker can log in and fetch /me', async () => {
    await createUserDirect('ADMIN', 'admin@coverfy.test')
    const adminToken = await loginAs('admin@coverfy.test')

    const createRes = await request(app)
      .post('/api/auth/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'broker@coverfy.test', password: TEST_PASSWORD, name: 'Broker Uno', role: 'BROKER' })

    expect(createRes.status).toBe(201)
    expect(createRes.body.user.email).toBe('broker@coverfy.test')

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'broker@coverfy.test', password: TEST_PASSWORD })

    expect(loginRes.status).toBe(200)
    expect(loginRes.body.user.name).toBe('Broker Uno')
    expect(loginRes.body.accessToken).toBeTruthy()

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`)

    expect(meRes.status).toBe(200)
    expect(meRes.body.user.email).toBe('broker@coverfy.test')
  })

  it('lists brokers for an admin', async () => {
    await createUserDirect('ADMIN', 'admin2@coverfy.test')
    const broker = await createUserDirect('BROKER', 'broker2@coverfy.test')
    const adminToken = await loginAs('admin2@coverfy.test')

    const res = await request(app)
      .get('/api/auth/brokers')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.some((b: any) => b.id === broker.id)).toBe(true)
  })

  it('blacklists the token on logout so it can no longer be used', async () => {
    await createUserDirect('BROKER', 'broker3@coverfy.test')
    const token = await loginAs('broker3@coverfy.test')

    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`)
    expect(logoutRes.status).toBe(200)

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
    expect(meRes.status).toBe(401)
  })

  it('completes a full 2FA setup -> confirm -> login -> disable cycle', async () => {
    await createUserDirect('BROKER', 'broker4@coverfy.test')
    const token = await loginAs('broker4@coverfy.test')

    const setupRes = await request(app)
      .post('/api/auth/2fa/setup')
      .set('Authorization', `Bearer ${token}`)
    expect(setupRes.status).toBe(200)
    expect(setupRes.body.secret).toBeTruthy()

    const code = await generate({ secret: setupRes.body.secret })

    const confirmRes = await request(app)
      .post('/api/auth/2fa/confirm')
      .set('Authorization', `Bearer ${token}`)
      .send({ code })
    expect(confirmRes.status).toBe(200)
    expect(confirmRes.body.backupCodes.length).toBeGreaterThan(0)

    // Login ahora debe pedir el segundo factor
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'broker4@coverfy.test', password: TEST_PASSWORD })
    expect(loginRes.status).toBe(200)
    expect(loginRes.body.twoFactorRequired).toBe(true)

    const user = await prisma.user.findUniqueOrThrow({ where: { email: 'broker4@coverfy.test' } })
    const secret = decrypt(user.twoFactorSecret as string)
    const loginCode = await generate({ secret })

    const verifyRes = await request(app)
      .post('/api/auth/login/verify-2fa')
      .send({ preAuthToken: loginRes.body.preAuthToken, code: loginCode })
    expect(verifyRes.status).toBe(200)
    expect(verifyRes.body.accessToken).toBeTruthy()

    const disableCode = await generate({ secret })
    const disableRes = await request(app)
      .post('/api/auth/2fa/disable')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: TEST_PASSWORD, code: disableCode })
    expect(disableRes.status).toBe(200)
  })
})
