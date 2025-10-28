// src/services/CategoriesService.ts
import { CategoryType } from '@/types/categories';
import { Category, PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withAccelerate());

// Interface para o corpo da requisição de criação de categoria
interface CreateCategoryPayload {
  categoryName: string;
}

export class CategoriesService {
  /**
   * Fetches all categories and formats them for the frontend.
   * @returns A promise that resolves to an array of CategoryType.
   */
  static async getAllCategories(): Promise<CategoryType[]> {
    try {
      const categories = await prisma.category.findMany({
        select: {
          id: true,
          categoryName: true
        },
        orderBy: {
          categoryName: 'asc' // Opcional: ordenar por nome
        }
      });

      const modifiedCategories: CategoryType[] = categories.map(category => ({
        id: category.id,
        name: category.categoryName // Mapeia categoryName para 'name' conforme CategoryType
      }));

      return modifiedCategories;
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Creates a new category.
   * @param data The category data to create.
   * @returns A promise that resolves to the created Category.
   * @throws Error if categoryName is missing or invalid, or if category already exists.
   */
  static async createCategory(data: CreateCategoryPayload): Promise<Category> {
    const { categoryName } = data;

    if (!categoryName || typeof categoryName !== 'string') {
      throw new Error('Missing or invalid categoryName.');
    }

    // --- MUDANÇA AQUI: Usar findFirst em vez de findUnique ---
    const existingCategory = await prisma.category.findFirst({
      where: { categoryName: categoryName }
    });

    if (existingCategory) {
      throw new Error(`Category with name '${categoryName}' already exists.`);
    }

    try {
      const newCategory = await prisma.category.create({
        data: {
          categoryName: categoryName
        }
      });
      return newCategory;
    } finally {
      await prisma.$disconnect();
    }
  }
}
