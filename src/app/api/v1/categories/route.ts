// src/app/api/categories/route.ts (example for App Router POST)
//import { auth } from '@/app/auth'; // Adjust path as needed
import { CategoryType } from '@/types/categories';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        categoryName: true
      }
    });

    const modifiedCategories: Array<CategoryType> = [];

    categories.forEach(category => {
      modifiedCategories.push({ id: category.id, name: category.categoryName });
    });

    return NextResponse.json(modifiedCategories, { status: 200 });
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
  // --- NextAuth.js v5 protection (similar to product POST) ---
  //const session = await auth();

  //   if (!session || !session.user || !session.user.email) {
  //     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  //   }

  //   try {
  //     const user = await prisma.user.findUnique({
  //       where: { email: session.user.email },
  //       include: { role: true }
  //     });

  //     if (!user || user.role.role !== 'admin') {
  //       // Assuming only admins can create categories
  //       return NextResponse.json(
  //         { message: 'Forbidden: Only admin users can create categories' },
  //         { status: 403 }
  //       );
  //     }
  //   } catch (error) {
  //     console.error('Error during user role verification:', error);
  //     return NextResponse.json(
  //       { message: 'Error verifying user role' },
  //       { status: 500 }
  //     );
  //   }
  // --- End NextAuth.js v5 protection ---

  try {
    interface CreateCategoryRequestBody {
      categoryName: string;
    }

    const body: CreateCategoryRequestBody = await req.json();
    const { categoryName } = body;

    // 1. Validation
    if (!categoryName || typeof categoryName !== 'string') {
      return NextResponse.json(
        { message: 'Missing or invalid categoryName' },
        { status: 400 }
      );
    }

    // 2. Create the category using Prisma
    // ONLY provide categoryName. createdAt and updatedAt are handled by Prisma/DB.
    const newCategory = await prisma.category.create({
      data: {
        categoryName: categoryName
      }
    });

    return NextResponse.json(newCategory, { status: 201 }); // 201 Created
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Use 'any' here temporarily if you don't want full Prisma error type guards
    console.error('Error creating category:', error);

    if (
      error.code === 'P2002' &&
      error.meta?.target?.includes('categoryName')
    ) {
      // P2002 is for unique constraint violation, useful if categoryName should be unique
      return NextResponse.json(
        { message: 'Category with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to create category', error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
