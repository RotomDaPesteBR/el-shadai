// src/services/ProductsService.ts
import { ProductType } from '@/types/products';
import { PrismaClient, Product } from '@prisma/client';

const prisma = new PrismaClient();

// Interface para o corpo da requisição de criação de produto
interface CreateProductPayload {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  image?: string | null;
}

export class ProductsService {
  /**
   * Fetches all products and formats them for the frontend.
   * @returns A promise that resolves to an array of ProductType.
   */
  static async getAllProducts(): Promise<ProductType[]> {
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

      const modifiedProducts: ProductType[] = products.map(product => {
        const { category, ...productWithoutCategory } = product;
        return {
          ...productWithoutCategory,
          categoryName: category.categoryName
        };
      });

      return modifiedProducts;
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Fetches a single product by its ID and formats it for the frontend.
   * @param id The ID of the product to fetch.
   * @returns A promise that resolves to a ProductType or null if not found.
   */
  static async getProductById(id: number): Promise<ProductType | null> {
    try {
      // Usando findUnique para buscar por ID (mais direto que findFirst quando buscando por chave primária)
      const product = await prisma.product.findUnique({
        where: { id: id },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          stock: true,
          image: true,
          categoryId: true, // Incluindo categoryId, se ProductType o espera
          category: {
            select: {
              categoryName: true
            }
          }
        }
      });

      if (!product) {
        return null; // Retorna null se o produto não for encontrado
      }

      // Transforma o produto do Prisma para o formato ProductType
      const { category, ...productWithoutCategory } = product;
      const modifiedProduct: ProductType = {
        ...productWithoutCategory,
        categoryName: category.categoryName
      };

      return modifiedProduct;
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Creates a new product.
   * @param data The product data to create.
   * @returns A promise that resolves to the created Product.
   */
  static async createProduct(data: CreateProductPayload): Promise<Product> {
    try {
      const newProduct = await prisma.product.create({
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          stock: data.stock,
          categoryId: data.categoryId,
          image: data.image
        }
      });
      return newProduct;
    } finally {
      await prisma.$disconnect();
    }
  }
}
