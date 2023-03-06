import { PrismaClient } from '@prisma/client'
import { createPassword, createUser } from './utils'

const prisma = new PrismaClient()

async function seed() {
  console.log('🌱 Seeding...')
  console.time(`🌱 Database has been seeded`)

  console.time('🧹 Cleaned up the database...')
  await prisma.user.deleteMany({ where: {} })
  console.timeEnd('🧹 Cleaned up the database...')

  console.time('👤 Create test user...')
  const userData = createUser('remixer')
  await prisma.user.create({
    data: {
      ...userData,
      password: {
        create: createPassword(userData.username),
      },
    },
  })
  console.timeEnd('👤 Create test user...')

  console.timeEnd(`🌱 Database has been seeded`)
}

seed()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
