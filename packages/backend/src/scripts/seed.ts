import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'
import prisma from '../config/prisma'
import { Role } from '../generated/prisma'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@coverfy.test'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin123!'
const BROKER_EMAIL = process.env.SEED_BROKER_EMAIL || 'broker@coverfy.test'
const BROKER_PASSWORD = process.env.SEED_BROKER_PASSWORD || 'Broker123!'

async function main() {
  const existingAdmin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } })
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)
    await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        password: hashedPassword,
        nombre: 'Admin Coverfy',
        role: Role.ADMIN,
      },
    })
    console.log(`Usuario admin creado: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
  } else {
    console.log(`Usuario admin ya existe: ${ADMIN_EMAIL}`)
  }

  const existingBroker = await prisma.user.findUnique({ where: { email: BROKER_EMAIL } })
  if (!existingBroker) {
    const hashedPassword = await bcrypt.hash(BROKER_PASSWORD, 10)
    await prisma.user.create({
      data: {
        email: BROKER_EMAIL,
        password: hashedPassword,
        nombre: 'Broker Coverfy',
        role: Role.BROKER,
      },
    })
    console.log(`Usuario broker creado: ${BROKER_EMAIL} / ${BROKER_PASSWORD}`)
  } else {
    console.log(`Usuario broker ya existe: ${BROKER_EMAIL}`)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
