import { auth } from '@/app/auth';
import { OrderService } from '@/services/OrderService';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    // Assuming a 'delivery' role for delivery personnel
    if (!session || !session.user || session.user.role !== 'delivery') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      return NextResponse.json({ message: 'Invalid Order ID' }, { status: 400 });
    }

    const { newStatus } = await request.json();
    if (!newStatus) {
      return NextResponse.json({ message: 'New status is required' }, { status: 400 });
    }

    const updatedOrder = await OrderService.updateOrderStatus(orderId, newStatus);

    return NextResponse.json({ message: 'Order status updated successfully', order: updatedOrder }, { status: 200 });
  } catch (error) {
    console.error("Error in PUT /api/v1/order/[id]/status:", error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
