import { auth } from '@/src/app/auth';
import { OrderService } from '@/src/services/OrderService';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const orders = await OrderService.getUserOrders(userId);

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/v1/user/orders:", error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
