import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withAccelerate());

async function main() {
  // Create Order States
  const pendingState = await prisma.orderState.findFirst({ where: { state: 'Pending' } });
  if (!pendingState) {
    await prisma.orderState.create({ data: { state: 'Pending' } });
  }

  const onTheWayState = await prisma.orderState.findFirst({ where: { state: 'On the way' } });
  if (!onTheWayState) {
    await prisma.orderState.create({ data: { state: 'On the way' } });
  }

  const deliveredState = await prisma.orderState.findFirst({ where: { state: 'Delivered' } });
  if (!deliveredState) {
    await prisma.orderState.create({ data: { state: 'Delivered' } });
  }

  // Create 'delivery' Role
  const deliveryRole = await prisma.role.findFirst({ where: { role: 'delivery' } });
  if (!deliveryRole) {
    await prisma.role.create({ data: { role: 'delivery' } });
  }

  // Update/Create Neighborhoods for Delivery
  // Assuming you have some existing neighborhoods or want to create new ones
  // Example: Mark an existing neighborhood as active for delivery
  const centro = await prisma.neighborhood.findFirst({ where: { description: 'Centro' } });
  if (centro) {
    await prisma.neighborhood.update({ where: { id: centro.id }, data: { active: true } });
  } else {
    await prisma.neighborhood.create({ data: { description: 'Centro', zone: 'Zona Central', active: true } });
  }

  const bairroA = await prisma.neighborhood.findFirst({ where: { description: 'Bairro A' } });
  if (bairroA) {
    await prisma.neighborhood.update({ where: { id: bairroA.id }, data: { active: true } });
  } else {
    await prisma.neighborhood.create({ data: { description: 'Bairro A', zone: 'Zona Norte', active: true } });
  }

  // Add more neighborhoods as needed

  // Create Delivery Methods
  const deliveryMethodDelivery = await prisma.deliveryMethod.findFirst({ where: { method: 1 } });
  if (!deliveryMethodDelivery) {
    await prisma.deliveryMethod.create({ data: { method: 1 } }); // 1 for delivery
  }

  const deliveryMethodPickup = await prisma.deliveryMethod.findFirst({ where: { method: 0 } });
  if (!deliveryMethodPickup) {
    await prisma.deliveryMethod.create({ data: { method: 0 } }); // 0 for pickup
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
