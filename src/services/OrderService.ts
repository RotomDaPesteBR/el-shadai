import { CartItem } from '@/types';
import { Prisma, PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withAccelerate());

interface OrderGroupByResult {
  orderStateId: number;
  _count: {
    id: number;
  };
  _sum: {
    price: Prisma.Decimal | null;
  };
}

interface OrderData {
  paymentMethod: 'cash' | 'card';
  changeNeeded?: number;
  deliveryOption: 'delivery' | 'pickup';
  cartItems: CartItem[];
}

export class OrderService {
  static async createOrder(userId: string, orderData: OrderData) {
    const { deliveryOption, cartItems } =
      orderData;

    // 1. Validate product stock
    const productIds = cartItems.map(item => item.id);
    const productsInDb = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      }
    });

    const stockErrors: {
      productId: number;
      productName: string;
      availableStock: number;
    }[] = [];
    let totalOrderPrice = 0;

    for (const cartItem of cartItems) {
      const dbProduct = productsInDb.find(p => p.id === cartItem.id);

      if (!dbProduct) {
        stockErrors.push({
          productId: cartItem.id,
          productName: cartItem.name,
          availableStock: 0
        });
        continue;
      }

      if (dbProduct.stock < cartItem.quantity) {
        stockErrors.push({
          productId: cartItem.id,
          productName: cartItem.name,
          availableStock: dbProduct.stock
        });
      }
      totalOrderPrice += dbProduct.price.toNumber() * cartItem.quantity;
    }

    if (stockErrors.length > 0) {
      throw new Error(
        `Stock validation failed: ${JSON.stringify(stockErrors)}`
      );
    }

    // 2. Determine OrderState and DeliveryMethod (placeholders for now)
    // In a real app, these would likely come from configuration or user selection
    const orderState = await prisma.orderState.findFirst({
      where: { state: 'Pending' }
    });
    const deliveryMethod = await prisma.deliveryMethod.findFirst({
      where: { method: deliveryOption === 'delivery' ? 1 : 0 }
    }); // Assuming 1 for delivery, 0 for pickup

    if (!orderState || !deliveryMethod) {
      throw new Error('Could not determine order state or delivery method.');
    }

    // 3. Create the Order
    const newOrder = await prisma.order.create({
      data: {
        price: totalOrderPrice,
        clientId: userId,
        staffId: userId, // Assuming client is also staff for now, or needs to be assigned later
        orderStateId: orderState.id,
        deliveryMethodId: deliveryMethod.id
        // Add payment method details if needed in Order model
      }
    });

    // 4. Create ItemProduct records and update product stock
    const itemProductCreations = cartItems.map(cartItem =>
      prisma.itemProduct.create({
        data: {
          orderId: newOrder.id,
          productId: cartItem.id
          // quantity: cartItem.quantity, // If ItemProduct had quantity field
        }
      })
    );

    const stockUpdates = cartItems.map(cartItem =>
      prisma.product.update({
        where: { id: cartItem.id },
        data: { stock: { decrement: cartItem.quantity } }
      })
    );

    await prisma.$transaction([...itemProductCreations, ...stockUpdates]);

    return newOrder;
  }

  static async getUserOrders(userId: string) {
    const orders = await prisma.order.findMany({
      where: {
        clientId: userId
      },
      select: {
        id: true,
        price: true,
        createdAt: true,
        orderState: {
          select: {
            state: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return orders.map(order => ({
      id: order.id,
      totalPrice: order.price.toNumber(),
      status: order.orderState.state,
      createdAt: order.createdAt
    }));
  }

  static async getOrderDetails(orderId: number, userId: string) {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        clientId: userId // Ensure the order belongs to the user
      },
      include: {
        orderState: {
          select: {
            state: true
          }
        },
        deliveryMethod: {
          select: {
            method: true
          }
        },
        itemProduct: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return null;
    }

    // Transform the order details to a more consumable format
    const productsInOrder = order.itemProduct.map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price.toNumber(),
      image: item.product.image,
      quantity: 1 // Assuming ItemProduct doesn't have quantity, default to 1 for now
    }));

    return {
      id: order.id,
      totalPrice: order.price.toNumber(),
      status: order.orderState.state,
      deliveryMethod: order.deliveryMethod.method === 1 ? 'delivery' : 'pickup',
      createdAt: order.createdAt,
      products: productsInOrder
      // Add payment method details if stored in Order model
    };
  }

  static async getPendingDeliveryOrders() {
    const orders = await prisma.order.findMany({
      where: {
        deliveryMethod: {
          method: 1, // Assuming 1 for delivery
        },
        orderState: {
          NOT: {
            state: 'Delivered',
          },
        },
      },
      include: {
        client: {
          select: {
            name: true,
            address: true,
            neighborhood: {
              select: {
                description: true,
                zone: true,
              },
            },
          },
        },
        orderState: {
          select: {
            state: true,
          },
        },
        itemProduct: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return orders.map(order => ({
      id: order.id,
      clientName: order.client.name,
      clientAddress: `${order.client.address}, ${order.client.neighborhood?.description} - ${order.client.neighborhood?.zone}`,
      totalPrice: order.price.toNumber(),
      status: order.orderState.state,
      products: order.itemProduct.map(item => ({
        name: item.product.name,
        price: item.product.price.toNumber(),
        image: item.product.image,
        quantity: 1, // Assuming ItemProduct doesn't have quantity
      })),
      createdAt: order.createdAt,
    }));
  }

  static async updateOrderStatus(orderId: number, newStatus: string) {
    const orderState = await prisma.orderState.findFirst({
      where: { state: newStatus },
    });

    if (!orderState) {
      throw new Error(`Invalid order status: ${newStatus}`);
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStateId: orderState.id,
      },
      include: {
        orderState: {
          select: {
            state: true,
          },
        },
      },
    });

    return updatedOrder;
  }

  static async getDashboardOrderMetrics() {
    try {
      const totalOrders = await prisma.order.count();
      const totalRevenueResult = await prisma.order.aggregate({
        _sum: {
          price: true,
        },
      });
      const totalRevenue = totalRevenueResult._sum.price?.toNumber() || 0;

      const ordersByStatus: OrderGroupByResult[] = (await prisma.order.groupBy({
        by: ['orderStateId'],
        _count: {
          id: true,
        },
        _sum: {
          price: true,
        },
      })) as OrderGroupByResult[];

      const orderStates = await prisma.orderState.findMany({
        select: {
          id: true,
          state: true,
        },
      });

      const statusMetrics = ordersByStatus.map(group => {
        const state = orderStates.find(s => s.id === group.orderStateId)?.state || 'Unknown';
        return {
          status: state,
          count: group._count.id,
          revenue: group._sum.price?.toNumber() || 0,
        };
      });

      return {
        totalOrders,
        totalRevenue,
        statusMetrics,
      };
    } finally {
      // await prisma.$disconnect(); // Removed to allow Accelerate to manage connections
    }
  }
}

