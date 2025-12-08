import { auth } from '@/app/auth';
import { OrderService } from '@/services/OrderService';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();

    // Check for 'delivery' or 'admin' role
    if (!session || !session.user || (session.user.role !== 'delivery' && session.user.role !== 'admin')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const orders = await OrderService.getPendingDeliveryOrders();

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/v1/delivery/orders:", error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
