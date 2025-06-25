import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Define an interface for the route segment parameters
interface ProductGetParams {
  params: {
    id: string; // The 'id' from the dynamic route [id] is always a string
  };
}

export async function GET(
  request: NextRequest,
  { params }: ProductGetParams // Use the defined interface here
) {
  const { id } = params; // params is already destructured, so just use 'id' directly

  try {
    // Ensure 'id' is parsed to an integer for Prisma's 'where' clause
    const productId = parseInt(id, 10);

    // Handle potential NaN if id is not a valid number
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
        // categoryId: false, // This line is causing a TypeScript error, 'false' is not a valid value for selection
        category: {
          select: {
            categoryName: true
          }
        }
      },
      where: { id: productId } // Use the parsed productId here
    });

    // If product is not found, return a 404
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
