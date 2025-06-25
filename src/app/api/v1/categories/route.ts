import { auth } from '@/app/auth';
import { CategoriesService } from '@/services/CategoriesService';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const categories = await CategoriesService.getAllCategories();
    return NextResponse.json({ data: categories }, { status: 200 });
  } catch (error) {
    console.error('Error fetching categories via service in API route:', error);
    return NextResponse.json(
      { message: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden: Only admin users can create categories' },
        { status: 403 }
      );
    }

    interface CreateCategoryRequestBody {
      categoryName: string;
    }

    const body: CreateCategoryRequestBody = await req.json();
    const { categoryName } = body;

    if (!categoryName || typeof categoryName !== 'string') {
      return NextResponse.json(
        { message: 'Missing or invalid categoryName' },
        { status: 400 }
      );
    }

    const newCategory = await CategoriesService.createCategory({
      categoryName
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating category via service in API route:', error);

    if (error instanceof Error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // P2002 is for unique constraint violation
        if (error.code === 'P2002') {
          // Safely check for meta and target properties
          const target = error.meta?.target;
          if (Array.isArray(target) && target.includes('categoryName')) {
            return NextResponse.json(
              { message: 'Category with this name already exists' },
              { status: 409 }
            );
          }
        }
        // For other known Prisma errors, you can add more 'else if' here
        return NextResponse.json(
          {
            message: 'Failed to create category (Prisma error)',
            error: error.message
          },
          { status: 500 }
        );
      }

      // If the error was thrown by the service with a specific message (not a direct Prisma error)
      if (error.message.includes('already exists')) {
        return NextResponse.json({ message: error.message }, { status: 409 });
      } else if (error.message.includes('Missing or invalid categoryName')) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      // Fallback for other generic errors (that are not Prisma errors or specific service messages)
      return NextResponse.json(
        { message: 'Failed to create category', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
