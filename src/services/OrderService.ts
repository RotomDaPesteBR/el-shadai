import { prisma } from '@/prisma';
import { CartItem } from '@/types';
import { Prisma } from '@prisma/client';

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
      where: { id: 1 } // 1: pendente
    });
    console.log('OrderState found:', orderState); // Add logging

    const deliveryMethod = await prisma.deliveryMethod.findFirst({
      where: { id: deliveryOption === 'delivery' ? 1 : 2 } // 1 for 'Entrega', 2 for 'Retirada'
    });
    console.log('DeliveryOption:', deliveryOption); // Add logging
    console.log('DeliveryMethod found:', deliveryMethod); // Add logging

    if (!orderState || !deliveryMethod) {
      console.error('Failed to determine order state or delivery method. OrderState:', orderState, 'DeliveryMethod:', deliveryMethod); // More detailed error logging
      throw new Error('Could not determine order state or delivery method.');
    }

    // 3. Create the Order
    const newOrder = await prisma.order.create({
      data: {
        price: totalOrderPrice,
        clientId: userId,
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user) {
      return null; // User not found
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId
      },
      include: {
        orderState: {
          select: {
            state: true
          }
        },
        deliveryMethod: {
          select: {
            id: true, // Select the id field
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
      return null; // Order not found
    }

    const userRole = user.role.role;
    let hasAccess = false;

    if (userRole === 'admin') {
      hasAccess = true;
    } else if (userRole === 'delivery') {
      if (
        order.staffId === userId ||
        (order.staffId === null && order.deliveryMethodId === 1)
      ) {
        hasAccess = true;
      }
    } else {
      // Assuming other roles are 'costumer' or similar
      if (order.clientId === userId) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return null; // Access denied
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
      deliveryMethod: order.deliveryMethod.id === 1 ? 'delivery' : 'pickup',
      createdAt: order.createdAt,
      products: productsInOrder
      // Add payment payment details if stored in Order model
    };
  }

  static async getPendingDeliveryOrders() {
    const orders = await prisma.order.findMany({
      where: {
        deliveryMethod: {
          id: 1, // Assuming 1 for delivery (Entrega)
        },
        orderState: {
          NOT: {
            id: 3, // 3 for Delivered
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

  static async updateOrderStatus(orderId: number, newStatusId: number, staffUserId?: string) {
    const orderState = await prisma.orderState.findFirst({
      where: { id: newStatusId },
    });

    if (!orderState) {
      throw new Error(`Invalid order status: ${newStatusId}`);
    }

    const data: Prisma.OrderUpdateInput = {
      orderState: {
        connect: {
          id: orderState.id
        }
      }
    };

    if (staffUserId) {
      data.staff = {
        connect: {
          id: staffUserId
        }
      };
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data,
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
      // 1. Total Orders and Revenue
      const totalOrders = await prisma.order.count();
      const totalRevenueResult = await prisma.order.aggregate({
        _sum: {
          price: true
        }
      });
      const totalRevenue = totalRevenueResult._sum.price?.toNumber() || 0;

      // 2. Monthly Sales for the Current Year
      const orders = await prisma.order.findMany({
        select: { createdAt: true, price: true }
      });

      const monthlySales = Array(12).fill(0);
      const currentYear = new Date().getFullYear();

      orders.forEach(order => {
        if (order.createdAt.getFullYear() === currentYear) {
          const month = order.createdAt.getMonth(); // 0-indexed (0 for Jan, 11 for Dec)
          monthlySales[month] += order.price.toNumber();
        }
      });

      // 3. Sales by Category
      const itemsSold = await prisma.itemProduct.findMany({
        include: {
          product: {
            select: {
              category: {
                select: {
                  categoryName: true
                }
              }
            }
          }
        }
      });

      const salesByCategory = new Map<string, number>();
      itemsSold.forEach(item => {
        const categoryName = item.product.category.categoryName;
        salesByCategory.set(
          categoryName,
          (salesByCategory.get(categoryName) || 0) + 1
        );
      });

      const categoryMetrics = Array.from(
        salesByCategory,
        ([name, value]) => ({
          name,
          value
        })
      );

      return {
        totalOrders,
        totalRevenue,
        monthlySales,
        categoryMetrics
      };
    } finally {
    }
  }
}

