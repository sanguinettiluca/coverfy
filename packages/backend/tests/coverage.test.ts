import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app, resetDatabase, createUserDirect, loginAs } from './helpers'

describe('coverages', () => {
  let token: string
  let companyId: string

  beforeEach(async () => {
    await resetDatabase()
    await createUserDirect('BROKER', 'broker@coverfy.test')
    token = await loginAs('broker@coverfy.test')

    const companyRes = await request(app)
      .post('/api/companias')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Aseguradora Norte' })
    companyId = companyRes.body.company.id
  })

  it('creates a coverage and lists it filtered by company and insurance type', async () => {
    const createRes = await request(app)
      .post('/api/coberturas')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Cobertura total', insuranceType: 'VEHICLE', companyId })
    expect(createRes.status).toBe(201)
    expect(createRes.body.coverage.name).toBe('Cobertura total')

    const listRes = await request(app)
      .get('/api/coberturas')
      .query({ companyId, insuranceType: 'VEHICLE' })
      .set('Authorization', `Bearer ${token}`)
    expect(listRes.status).toBe(200)
    expect(listRes.body.length).toBe(1)
    expect(listRes.body[0].insuranceType).toBe('VEHICLE')
  })

  it('rejects listing coverages without a companyId', async () => {
    const res = await request(app)
      .get('/api/coberturas')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(400)
  })
})
