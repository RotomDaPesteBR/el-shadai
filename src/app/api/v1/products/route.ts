import { auth } from '@/app/auth';
import { ProductType } from '@/types/products';
import { PrismaClient, Product } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Define the type for the grouped products output
type ProductsType = Array<ProductType>;

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        image: true,
        categoryId: true,
        category: {
          select: {
            categoryName: true
          }
        }
      }
    });

    const modifiedProducts: ProductsType = [];

    products.forEach(product => {
      // Destructure to omit specific fields directly in the type
      const { category, ...productWithoutCategory } = product;

      const modifiedProduct: ProductType = {
        ...productWithoutCategory,
        categoryName: category.categoryName
      };

      modifiedProducts.push(modifiedProduct);
    });

    return NextResponse.json(modifiedProducts, { status: 200 });
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

export async function POST(req: Request) {
  // 1. Authenticate and get session with NextAuth.js v5
  const session = await auth();

  // Basic session check
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // 2. Implement Role-Based Access Control (RBAC)
  try {
    // Check if the user exists and has the 'admin' role
    if (!session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden: Only admin users can create products' },
        { status: 403 }
      );
    }

    // Type the incoming request body
    interface CreateProductRequestBody {
      name: string;
      description: string;
      price: number;
      stock: number;
      categoryId: number;
      image?: string | null;
    }

    const body: CreateProductRequestBody = await req.json();
    const { name, description, price, stock, categoryId, image } = body;

    if (
      !name ||
      !description ||
      typeof price !== 'number' ||
      typeof stock !== 'number' ||
      typeof categoryId !== 'number'
    ) {
      return NextResponse.json(
        { message: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    const newProduct: Product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        categoryId,
        image
      }
    });

    return NextResponse.json(newProduct, { status: 201 }); // 201 Created
  } catch (error) {
    console.error('Error creating product:', error);

    // Using type guards for PrismaClientKnownRequestError for specific error handling
    if (error instanceof Error) {
      // Prisma errors usually have a 'code' property
      const prismaError = error as { code?: string; message: string }; // Type assertion for common Prisma error structure

      if (prismaError.code === 'P2003') {
        // Foreign key constraint failed (e.g., categoryId does not exist)
        return NextResponse.json(
          { message: 'Category not found or invalid categoryId' },
          { status: 404 }
        );
      }
      if (prismaError.code === 'P2025') {
        // No record found for the provided ID (e.g., user not found for session email)
        return NextResponse.json(
          { message: 'User not found in database or user session issue.' },
          { status: 404 }
        );
      }
      // Fallback for other generic errors
      return NextResponse.json(
        { message: 'Failed to create product', error: prismaError.message },
        { status: 500 }
      );
    }

    // Generic error handling if it's not an instance of Error
    return NextResponse.json(
      { message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
