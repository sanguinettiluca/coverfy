import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app, resetDatabase, createUserDirect, loginAs } from './helpers'

describe('claims', () => {
  let token: string
  let companyId: string
  let clientId: string
  let vehiclePolicyId: string
  let lifePolicyId: string

  beforeEach(async () => {
    await resetDatabase()
    await createUserDirect('BROKER', 'broker@coverfy.test')
    token = await loginAs('broker@coverfy.test')

    const companyRes = await request(app)
      .post('/api/companias')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Aseguradora Sur' })
    companyId = companyRes.body.company.id

    const clientRes = await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Marta', lastName: 'Diaz', documentNumber: '55443322', email: 'marta@example.com', phone: '099333444', address: 'Calle 1' })
    clientId = clientRes.body.client.id

    const vehicleRes = await request(app)
      .post('/api/polizas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        policyNumber: 'POL-VEH-1', insuranceType: 'VEHICLE', clientId, companyId,
        vehicleDetails: { brand: 'Ford', model: 'Fiesta', year: 2019, licensePlate: 'XYZ999', registrationNumber: '1', chassisNumber: '1', engineNumber: '1' }
      })
    vehiclePolicyId = vehicleRes.body.policy.id

    const lifeRes = await request(app)
      .post('/api/polizas')
      .set('Authorization', `Bearer ${token}`)
      .send({ policyNumber: 'POL-LIFE-2', insuranceType: 'LIFE', clientId, companyId, lifeDetails: { beneficiary: 'Familia Diaz' } })
    lifePolicyId = lifeRes.body.policy.id
  })

  it('registers a claim on a vehicle policy and supports the full CRUD flow', async () => {
    const createRes = await request(app)
      .post('/api/siniestros')
      .set('Authorization', `Bearer ${token}`)
      .send({ policyId: vehiclePolicyId, incidentDate: '2026-07-01' })
    expect(createRes.status).toBe(201)
    const claimId = createRes.body.claim.id
    expect(createRes.body.claim.status).toBe('OPEN')

    const listRes = await request(app)
      .get('/api/siniestros')
      .set('Authorization', `Bearer ${token}`)
    expect(listRes.status).toBe(200)
    expect(listRes.body.claims.some((c: any) => c.id === claimId)).toBe(true)

    const getRes = await request(app)
      .get(`/api/siniestros/${claimId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(getRes.status).toBe(200)

    const updateRes = await request(app)
      .put(`/api/siniestros/${claimId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'CLOSED' })
    expect(updateRes.status).toBe(200)
    expect(updateRes.body.claim.status).toBe('CLOSED')

    const deleteRes = await request(app)
      .delete(`/api/siniestros/${claimId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(deleteRes.status).toBe(200)
  })

  it('rejects registering a claim on a non-vehicle policy', async () => {
    const res = await request(app)
      .post('/api/siniestros')
      .set('Authorization', `Bearer ${token}`)
      .send({ policyId: lifePolicyId, incidentDate: '2026-07-01' })
    expect(res.status).toBe(400)
  })
})
