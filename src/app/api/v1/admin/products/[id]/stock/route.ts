import { NextRequest, NextResponse } from 'next/server';
import { ProductsService } from '@/services/ProductsService';
import { auth } from '@/app/auth'; // Import the auth function

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return NextResponse.json(
        { message: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const newStock = parseInt(body.stock, 10);

    if (isNaN(newStock) || newStock < 0) {
      return NextResponse.json(
        { message: 'Invalid stock quantity' },
        { status: 400 }
      );
    }

    await ProductsService.updateProductStock(productId, newStock);

    return NextResponse.json(
      { message: 'Product stock updated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating product stock:', error);
    return NextResponse.json(
      { message: 'Failed to update product stock', error: error.message },
      { status: 500 }
    );
  }
}
