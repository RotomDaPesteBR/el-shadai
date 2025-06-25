import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  try {
    const product = await prisma.product.findFirst({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        image: true,
        categoryId: false,
        category: {
          select: {
            categoryName: true
          }
        }
      },
      where: { id: parseInt(id) }
    });

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    // Use instanceof for better error checking if possible with Prisma errors
    return NextResponse.json(
      { message: 'Failed to fetch products' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
