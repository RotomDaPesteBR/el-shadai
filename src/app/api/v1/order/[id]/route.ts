import { auth } from '@/app/auth';
import { OrderService } from '@/services/OrderService';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = await params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return NextResponse.json({ message: 'Invalid Order ID' }, { status: 400 });
    }

    const orderDetails = await OrderService.getOrderDetails(orderId, userId);

    if (!orderDetails) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order: orderDetails }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/v1/order/[id]:", error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
