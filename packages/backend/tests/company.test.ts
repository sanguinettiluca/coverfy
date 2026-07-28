import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app, resetDatabase, createUserDirect, loginAs } from './helpers'

describe('companies', () => {
  let token: string

  beforeEach(async () => {
    await resetDatabase()
    await createUserDirect('BROKER', 'broker@coverfy.test')
    token = await loginAs('broker@coverfy.test')
  })

  it('supports the full CRUD flow', async () => {
    const createRes = await request(app)
      .post('/api/companias')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Aseguradora Sol', commissionRate: 12.5 })
    expect(createRes.status).toBe(201)
    const companyId = createRes.body.company.id
    expect(createRes.body.company.name).toBe('Aseguradora Sol')

    const listRes = await request(app)
      .get('/api/companias')
      .set('Authorization', `Bearer ${token}`)
    expect(listRes.status).toBe(200)
    expect(listRes.body.some((c: any) => c.id === companyId)).toBe(true)

    const getRes = await request(app)
      .get(`/api/companias/${companyId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(getRes.status).toBe(200)
    expect(getRes.body.commissionRate).toBe(12.5)

    const updateRes = await request(app)
      .put(`/api/companias/${companyId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ commissionRate: 20 })
    expect(updateRes.status).toBe(200)
    expect(updateRes.body.company.commissionRate).toBe(20)

    const deleteRes = await request(app)
      .delete(`/api/companias/${companyId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(deleteRes.status).toBe(200)

    const getAfterDeleteRes = await request(app)
      .get(`/api/companias/${companyId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(getAfterDeleteRes.status).toBe(404)
  })
})
