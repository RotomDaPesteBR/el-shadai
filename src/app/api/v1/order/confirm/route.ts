import { auth } from '@/app/auth';
import { OrderService } from '@/services/OrderService';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const orderData = await request.json();

    // Basic validation of incoming data
    if (!orderData.cartItems || orderData.cartItems.length === 0) {
      return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
    }

    const newOrder = await OrderService.createOrder(userId, orderData);

    return NextResponse.json({ message: 'Order confirmed successfully', order: newOrder }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error in POST /api/v1/order/confirm:", error);

    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
      errorMessage = error.message;

      // Handle stock validation errors specifically
      if (errorMessage.startsWith('Stock validation failed')) {
        const stockErrors = JSON.parse(errorMessage.replace('Stock validation failed: ', ''));
        return NextResponse.json({ message: 'Stock validation failed', errors: stockErrors }, { status: 400 });
      }
    }

    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
