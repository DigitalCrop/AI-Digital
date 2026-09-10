import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const password = 'P@ssw0rd!'
  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email: 'jane.doe@example.com' },
    update: {},
    create: {
      email: 'jane.doe@example.com',
      passwordHash,
      customers: {
        create: {
          firstName: 'Jane',
          lastName: 'Doe'
        }
      }
    },
    include: { customers: true }
  })

  console.log('Seeded user:', { id: user.id, email: user.email })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
