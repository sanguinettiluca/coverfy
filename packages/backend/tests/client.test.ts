import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app, resetDatabase, createUserDirect, loginAs } from './helpers'

describe('clients', () => {
  let token: string

  beforeEach(async () => {
    await resetDatabase()
    await createUserDirect('BROKER', 'broker@coverfy.test')
    token = await loginAs('broker@coverfy.test')
  })

  it('supports the full CRUD + find-by-document flow', async () => {
    const createRes = await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'Ana',
        lastName: 'Gomez',
        documentNumber: '12345678',
        email: 'ana@example.com',
        phone: '099111222',
        address: 'Calle Falsa 123',
      })
    expect(createRes.status).toBe(201)
    const clientId = createRes.body.client.id
    expect(createRes.body.client.firstName).toBe('Ana')

    const listRes = await request(app)
      .get('/api/clientes')
      .query({ search: 'Ana' })
      .set('Authorization', `Bearer ${token}`)
    expect(listRes.status).toBe(200)
    expect(listRes.body.total).toBe(1)
    expect(listRes.body.clients[0].id).toBe(clientId)

    const getRes = await request(app)
      .get(`/api/clientes/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(getRes.status).toBe(200)
    expect(getRes.body.lastName).toBe('Gomez')

    const findRes = await request(app)
      .get('/api/clientes/documento/12345678')
      .set('Authorization', `Bearer ${token}`)
    expect(findRes.status).toBe(200)
    expect(findRes.body.id).toBe(clientId)

    const updateRes = await request(app)
      .put(`/api/clientes/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ address: 'Nueva Direccion 456' })
    expect(updateRes.status).toBe(200)
    expect(updateRes.body.client.address).toBe('Nueva Direccion 456')

    const deleteRes = await request(app)
      .delete(`/api/clientes/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(deleteRes.status).toBe(200)

    const getAfterDeleteRes = await request(app)
      .get(`/api/clientes/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(getAfterDeleteRes.status).toBe(404)
  })

  it('rejects creating a client without required fields', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Solo Nombre' })
    expect(res.status).toBe(400)
  })
})
