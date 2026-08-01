import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

async function main() {
  console.log('Seeding blood types...');
  for (const name of BLOOD_TYPES) {
    await prisma.bloodType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('Seeding demo admin user...');
  const hashedPassword = await bcrypt.hash('Admin@12345', 10);
  await prisma.user.upsert({
    where: { email: 'admin@blooddonation.local' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@blooddonation.local',
      phone: '+60100000000',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
