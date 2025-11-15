import { auth } from '@/app/auth';
import { OrderService } from '@/services/OrderService';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    // Assuming 'delivery' or 'admin' role for delivery personnel
    if (!session || !session.user || (session.user.role !== 'delivery' && session.user.role !== 'admin')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      return NextResponse.json({ message: 'Invalid Order ID' }, { status: 400 });
    }

    const { newStatusId } = await request.json();
    if (typeof newStatusId !== 'number') {
      return NextResponse.json({ message: 'New status ID is required and must be a number' }, { status: 400 });
    }

    const updatedOrder = await OrderService.updateOrderStatus(orderId, newStatusId);

    return NextResponse.json({ message: 'Order status updated successfully', order: updatedOrder }, { status: 200 });
  } catch (error) {
    console.error("Error in PUT /api/v1/order/[id]/status:", error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
