import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app, resetDatabase, createUserDirect, loginAs } from './helpers'

describe('reports', () => {
  let token: string

  beforeEach(async () => {
    await resetDatabase()
    await createUserDirect('BROKER', 'broker@coverfy.test')
    token = await loginAs('broker@coverfy.test')
  })

  it('returns active policies by company and cumulative clients by month', async () => {
    const companyRes = await request(app)
      .post('/api/companias')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Aseguradora Oeste' })
    const companyId = companyRes.body.company.id

    const clientRes = await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Pedro', lastName: 'Lopez', documentNumber: '11223344', email: 'pedro@example.com', phone: '099777888', address: 'Calle 3' })
    const clientId = clientRes.body.client.id

    await request(app)
      .post('/api/polizas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        policyNumber: 'POL-REP-1', insuranceType: 'VEHICLE', clientId, companyId, status: 'ACTIVE',
        vehicleDetails: { brand: 'VW', model: 'Gol', year: 2018, licensePlate: 'REP123', registrationNumber: '1', chassisNumber: '1', engineNumber: '1' }
      })

    const res = await request(app)
      .get('/api/reportes/estadisticas')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.activePoliciesByCompany).toEqual([{ name: 'Aseguradora Oeste', count: 1 }])
    expect(res.body.cumulativeClientsByMonth.length).toBeGreaterThan(0)
    expect(res.body.cumulativeClientsByMonth[0].total).toBeGreaterThan(0)
  })
})
