import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@ddcm.com'
  const plainPassword = 'AdminPass123'
  const passwordHash = await bcrypt.hash(plainPassword, 12)

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  })

  if (existingAdmin) {
    console.log('Admin already exists.')
    return
  }

  await prisma.user.create({
    data: {
      fullName: 'System Administrator',
      email,
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
      mfaEnabled: false,
    },
  })

  console.log('Admin seeded successfully.')
  console.log(`Email: ${email}`)
  console.log(`Password: ${plainPassword}`)
}

main()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })