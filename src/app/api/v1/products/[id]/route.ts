// src/app/api/v1/products/[id]/route.ts
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  try {
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return NextResponse.json(
        { message: 'Invalid product ID provided.' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findFirst({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        image: true,
        category: {
          select: {
            categoryName: true
          }
        }
      },
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { message: 'Failed to fetch product.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
