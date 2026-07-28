import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app, resetDatabase, createUserDirect, loginAs } from './helpers'

describe('policies', () => {
  let token: string
  let companyId: string
  let clientId: string

  beforeEach(async () => {
    await resetDatabase()
    await createUserDirect('BROKER', 'broker@coverfy.test')
    token = await loginAs('broker@coverfy.test')

    const companyRes = await request(app)
      .post('/api/companias')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Aseguradora Este' })
    companyId = companyRes.body.company.id

    const clientRes = await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Luis', lastName: 'Perez', documentNumber: '99887766', email: 'luis@example.com', phone: '099555666', address: 'Calle 2' })
    clientId = clientRes.body.client.id
  })

  it('creates a VEHICLE policy with its details and finds it via search', async () => {
    const createRes = await request(app)
      .post('/api/polizas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        policyNumber: 'POL-001',
        insuranceType: 'VEHICLE',
        clientId,
        companyId,
        totalAmount: 1000,
        vehicleDetails: {
          brand: 'Toyota', model: 'Corolla', year: 2020,
          licensePlate: 'ABC1234', registrationNumber: '123456', chassisNumber: 'CH1', engineNumber: 'EN1'
        }
      })
    expect(createRes.status).toBe(201)
    expect(createRes.body.policy.vehicleDetails.brand).toBe('Toyota')
    const policyId = createRes.body.policy.id

    const listRes = await request(app)
      .get('/api/polizas')
      .query({ search: 'ABC1234' })
      .set('Authorization', `Bearer ${token}`)
    expect(listRes.status).toBe(200)
    expect(listRes.body.policies.some((p: any) => p.id === policyId)).toBe(true)

    const updateRes = await request(app)
      .put(`/api/polizas/${policyId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'EXPIRED', totalAmount: 1500 })
    expect(updateRes.status).toBe(200)
    expect(updateRes.body.policy.status).toBe('EXPIRED')
    expect(updateRes.body.policy.totalAmount).toBe(1500)

    const getRes = await request(app)
      .get(`/api/polizas/${policyId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(getRes.status).toBe(200)
    expect(getRes.body.vehicleDetails.licensePlate).toBe('ABC1234')

    const deleteRes = await request(app)
      .delete(`/api/polizas/${policyId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(deleteRes.status).toBe(200)
  })

  it('creates a TRIP policy and a LIFE policy with their own detail shapes', async () => {
    const tripRes = await request(app)
      .post('/api/polizas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        policyNumber: 'POL-TRIP-1',
        insuranceType: 'TRIP',
        clientId,
        companyId,
        tripDetails: {
          destination: 'Brasil',
          departureDate: '2026-08-01',
          returnDate: '2026-08-15',
          passengers: 2,
        }
      })
    expect(tripRes.status).toBe(201)
    expect(tripRes.body.policy.tripDetails.destination).toBe('Brasil')

    const lifeRes = await request(app)
      .post('/api/polizas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        policyNumber: 'POL-LIFE-1',
        insuranceType: 'LIFE',
        clientId,
        companyId,
        lifeDetails: { insuredAmount: 50000, beneficiary: 'Familia Perez' }
      })
    expect(lifeRes.status).toBe(201)
    expect(lifeRes.body.policy.lifeDetails.beneficiary).toBe('Familia Perez')
  })

  it('rejects a policy whose detail object does not match its insuranceType', async () => {
    const res = await request(app)
      .post('/api/polizas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        policyNumber: 'POL-BAD',
        insuranceType: 'VEHICLE',
        clientId,
        companyId,
        tripDetails: { destination: 'Brasil', departureDate: '2026-08-01', returnDate: '2026-08-15', passengers: 2 }
      })
    expect(res.status).toBe(400)
  })
})
