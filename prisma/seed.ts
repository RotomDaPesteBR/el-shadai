import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed Order States
  await prisma.orderState.upsert({
    where: { id: 1 },
    update: {
      state: 'Pendente',
    },
    create: {
      id: 1,
      state: 'Pendente',
    },
  });

  await prisma.orderState.upsert({
    where: { id: 2 },
    update: {
      state: 'A caminho',
    },
    create: {
      id: 2,
      state: 'A caminho',
    },
  });

  await prisma.orderState.upsert({
    where: { id: 3 },
    update: {
      state: 'Entregue',
    },
    create: {
      id: 3,
      state: 'Entregue',
    },
  });

  // Seed Delivery Methods
  // WARNING: This will cause a type error with your current schema if 'method' is an integer.
  // You have indicated you plan to migrate the schema later to support string values.
  await prisma.deliveryMethod.upsert({
    where: { id: 1 },
    update: {
      method: 'Entrega', // Changed to string as requested
    },
    create: {
      id: 1,
      method: 'Entrega', // Changed to string as requested
    },
  });

  // Seed DeliveryMethod - Retirada
  await prisma.deliveryMethod.upsert({
    where: { id: 2 },
    update: {
      method: 'Retirada', // Changed to string as requested
    },
    create: {
      id: 2,
      method: 'Retirada', // Changed to string as requested
    },
  });

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
