// src/services/ProductsService.ts
import { ProductType } from '@/types/products';
import { PrismaClient, Product } from '@prisma/client';
// Import Decimal from Prisma's runtime library for type checking and conversion
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// Interface para o corpo da requisição de criação de produto
interface CreateProductPayload {
  name: string;
  description: string;
  price: number; // Assuming ProductType expects a number here
  stock: number;
  categoryId: number;
  image?: string | null;
}

export class ProductsService {
  /**
   * Fetches all products and formats them for the frontend.
   * Converts Decimal prices to numbers.
   * @returns A promise that resolves to an array of ProductType.
   */
  static async getAllProducts(): Promise<ProductType[]> {
    try {
      const products = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          price: true, // Prisma returns this as Decimal
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
        const { category, price, ...productWithoutCategory } = product;
        return {
          ...productWithoutCategory,
          // Convert Decimal price to a plain number
          price: price instanceof Decimal ? price.toNumber() : Number(price),
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
   * Converts Decimal price to number.
   * @param id The ID of the product to fetch.
   * @returns A promise that resolves to a ProductType or null if not found.
   */
  static async getProductById(id: number): Promise<ProductType | null> {
    try {
      const product = await prisma.product.findUnique({
        // Changed from findFirst to findUnique as per earlier discussion for ID
        where: { id: id },
        select: {
          id: true,
          name: true,
          description: true,
          price: true, // Prisma returns this as Decimal
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

      if (!product) {
        return null; // Returns null if product not found
      }

      // Transform the Prisma product into ProductType format
      const { category, price, ...productWithoutCategory } = product;
      const modifiedProduct: ProductType = {
        ...productWithoutCategory,
        // Convert Decimal price to a plain number
        price: price instanceof Decimal ? price.toNumber() : Number(price),
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
          // Prisma handles conversion from number to Decimal on insert
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
