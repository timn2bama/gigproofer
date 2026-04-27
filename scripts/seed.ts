import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Check if test user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'john@doe.com' },
  });

  if (existingUser) {
    console.log('Test user already exists, skipping seed.');
    return;
  }

  // Create test worker user with active subscription
  const hashedPassword = await bcrypt.hash('johndoe123', 12);

  const testUser = await prisma.user.create({
    data: {
      email: 'john@doe.com',
      password: hashedPassword,
      name: 'John Doe',
      role: 'Worker',
      subscriptionStatus: 'active',
    },
  });

  console.log('Created test user:', testUser.email);

  // Add some sample income records for the test user
  const sampleRecords = [
    {
      date: new Date('2026-01-05'),
      amount: 450.75,
      platform: 'Uber',
      paymentType: 'weekly',
    },
    {
      date: new Date('2026-01-03'),
      amount: 320.50,
      platform: 'DoorDash',
      paymentType: 'weekly',
    },
    {
      date: new Date('2025-12-29'),
      amount: 485.25,
      platform: 'Uber',
      paymentType: 'weekly',
    },
    {
      date: new Date('2025-12-27'),
      amount: 295.00,
      platform: 'Instacart',
      paymentType: 'weekly',
    },
    {
      date: new Date('2025-12-22'),
      amount: 510.80,
      platform: 'Uber',
      paymentType: 'weekly',
    },
    {
      date: new Date('2025-12-20'),
      amount: 380.45,
      platform: 'Lyft',
      paymentType: 'weekly',
    },
  ];

  for (const record of sampleRecords) {
    await prisma.incomeRecord.create({
      data: {
        userId: testUser.id,
        ...record,
      },
    });
  }

  console.log('Created sample income records');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
