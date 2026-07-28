import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app, resetDatabase, createUserDirect, loginAs } from './helpers'

describe('quick messages', () => {
  let token: string

  beforeEach(async () => {
    await resetDatabase()
    await createUserDirect('BROKER', 'broker@coverfy.test')
    token = await loginAs('broker@coverfy.test')
  })

  it('supports the full CRUD flow', async () => {
    const createRes = await request(app)
      .post('/api/mensajes-rapidos')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Bienvenida', message: 'Hola! Gracias por contactarnos.' })
    expect(createRes.status).toBe(201)
    const messageId = createRes.body.quickMessage.id
    expect(createRes.body.quickMessage.name).toBe('Bienvenida')

    const listRes = await request(app)
      .get('/api/mensajes-rapidos')
      .set('Authorization', `Bearer ${token}`)
    expect(listRes.status).toBe(200)
    expect(listRes.body.some((m: any) => m.id === messageId)).toBe(true)

    const getRes = await request(app)
      .get(`/api/mensajes-rapidos/${messageId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(getRes.status).toBe(200)
    expect(getRes.body.message).toBe('Hola! Gracias por contactarnos.')

    const updateRes = await request(app)
      .put(`/api/mensajes-rapidos/${messageId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'Mensaje actualizado' })
    expect(updateRes.status).toBe(200)
    expect(updateRes.body.quickMessage.message).toBe('Mensaje actualizado')

    const deleteRes = await request(app)
      .delete(`/api/mensajes-rapidos/${messageId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(deleteRes.status).toBe(200)

    const getAfterDeleteRes = await request(app)
      .get(`/api/mensajes-rapidos/${messageId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(getAfterDeleteRes.status).toBe(404)
  })
})
