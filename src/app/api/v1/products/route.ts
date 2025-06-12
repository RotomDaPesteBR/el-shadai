/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient, Product } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Define the type for the grouped products output
type GroupedProducts = {
  [categoryName: string]: Omit<
    Product,
    'createdAt' | 'updatedAt' | 'categoryId'
  >[];
};

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

    const groupedProducts: GroupedProducts = {};

    products.forEach(product => {
      // Ensure categoryName is a string, defaulting to 'Uncategorized' if somehow null/undefined
      const categoryName: string =
        product.category?.categoryName || 'Uncategorized';

      if (!groupedProducts[categoryName]) {
        groupedProducts[categoryName] = [];
      }

      // Destructure to omit specific fields directly in the type
      const { category, categoryId, ...productWithoutCategoryAndDates } =
        product;
      groupedProducts[categoryName].push(
        productWithoutCategoryAndDates as Omit<
          Product,
          'createdAt' | 'updatedAt' | 'categoryId'
        > & { image: string | null }
      );
    });

    return NextResponse.json(groupedProducts, { status: 200 });
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
  // const session = await auth();

  // // Basic session check
  // if (!session || !session.user || !session.user.email) {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }

  // 2. Implement Role-Based Access Control (RBAC)
  try {
    // // Specify the return type of findUnique to include the role
    // const user: (User & { role: Role }) | null = await prisma.user.findUnique({
    //   where: { email: session.user.email }, // session.user.email is already type string | undefined, TS should handle it.
    //   include: { role: true }
    // });

    // // Check if the user exists and has the 'admin' role
    // if (!user || user.role.role !== 'admin') {
    //   return NextResponse.json(
    //     { message: 'Forbidden: Only admin users can create products' },
    //     { status: 403 }
    //   );
    // }

    // Type the incoming request body
    interface CreateProductRequestBody {
      name: string;
      description: string;
      price: number; // Expect number from client, convert to Decimal
      stock: number;
      categoryId: number;
    }

    const body: CreateProductRequestBody = await req.json();
    const { name, description, price, stock, categoryId } = body;

    // 3. Basic validation
    // Ensure all required fields are present and correctly typed (from the interface)
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

    // Convert price to Decimal type for Prisma (Prisma handles number to Decimal conversion automatically)
    // No need for parseFloat here if `price` is already a number type from the interface
    // However, if you anticipate string input for price from forms etc., parseFloat is still needed.
    // Given 'typeof price !== 'number'', it implies it's already a number or we're rejecting.
    // If you want to be robust to string numbers (e.g., "799.99"), then:
    // const productPrice = typeof price === 'string' ? parseFloat(price) : price;
    // if (isNaN(productPrice)) { /* ... error */ }

    // Convert stock to Int type for Prisma (Prisma handles number to Int conversion automatically)
    // Similar logic for parseInt if you anticipate string input.

    // 4. Create the product
    const newProduct: Product = await prisma.product.create({
      data: {
        name,
        description,
        price, // Directly use the number as Prisma will convert to Decimal
        stock, // Directly use the number as Prisma will convert to Int
        categoryId
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
