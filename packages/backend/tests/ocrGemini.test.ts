import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { app, resetDatabase, createUserDirect, loginAs } from './helpers'

vi.mock('tesseract.js', () => {
  const recognize = vi.fn().mockResolvedValue({
    data: { text: 'DOCUMENTO\n1.234.567-8\nNOMBRE\nJUAN\nAPELLIDO\nPEREZ\n01/02/1990' }
  })
  return { default: { recognize }, recognize }
})

vi.mock('@google/genai', () => {
  class GoogleGenAI {
    models = {
      generateContent: vi.fn().mockResolvedValue({
        text: JSON.stringify({
          documentNumber: '12345678',
          firstName: 'Juan',
          lastName: 'Perez',
          dateOfBirth: '01/02/1990',
        }),
      }),
    }
  }
  return { GoogleGenAI }
})

describe('ocr + gemini id card scanning', () => {
  let token: string

  beforeEach(async () => {
    await resetDatabase()
    await createUserDirect('BROKER', 'broker@coverfy.test')
    token = await loginAs('broker@coverfy.test')
  })

  it('extracts id card data via the tesseract-based OCR endpoint', async () => {
    const res = await request(app)
      .post('/api/ocr/cedula')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('fake-image-bytes'), 'cedula.jpg')

    expect(res.status).toBe(200)
    expect(res.body.documentNumber).toBe('12345678')
    expect(res.body.firstName).toBe('Juan')
    expect(res.body.lastName).toBe('Perez')
  })

  it('extracts id card data via the Gemini-based endpoint', async () => {
    const res = await request(app)
      .post('/api/ocr/reconocimiento')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('fake-image-bytes'), 'cedula.jpg')

    expect(res.status).toBe(200)
    expect(res.body.documentNumber).toBe('12345678')
    expect(res.body.firstName).toBe('Juan')
    expect(res.body.lastName).toBe('Perez')
  })
})
