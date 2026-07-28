import bcrypt from 'bcryptjs'
import request from 'supertest'
import prisma from '../src/config/prisma'
import app from '../src/app'
import { Role } from '../src/generated/prisma'

// Reinicia los datos de la base (usada en este entorno de desarrollo) antes de cada suite,
// respetando el orden de las foreign keys.
export async function resetDatabase() {
  await prisma.document.deleteMany()
  await prisma.vehicleDetails.deleteMany()
  await prisma.tripDetails.deleteMany()
  await prisma.rentalDetails.deleteMany()
  await prisma.homeDetails.deleteMany()
  await prisma.businessDetails.deleteMany()
  await prisma.liabilityDetails.deleteMany()
  await prisma.bondDetails.deleteMany()
  await prisma.lifeDetails.deleteMany()
  await prisma.otherDetails.deleteMany()
  await prisma.claim.deleteMany()
  await prisma.policy.deleteMany()
  await prisma.coverage.deleteMany()
  await prisma.client.deleteMany()
  await prisma.quickMessage.deleteMany()
  await prisma.company.deleteMany()
  await prisma.tokenBlacklist.deleteMany()
  await prisma.user.deleteMany()
}

export const TEST_PASSWORD = 'Sup3rSecret!'

export async function createUserDirect(role: Role, email: string, brokerId?: string) {
  const hashed = await bcrypt.hash(TEST_PASSWORD, 10)
  return prisma.user.create({
    data: { email, password: hashed, name: 'Test User', role, brokerId: brokerId ?? null }
  })
}

export async function loginAs(email: string, password: string = TEST_PASSWORD): Promise<string> {
  const res = await request(app).post('/api/auth/login').send({ email, password })
  if (!res.body.accessToken) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(res.body)}`)
  }
  return res.body.accessToken as string
}

export { app, prisma }
