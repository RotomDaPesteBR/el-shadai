import { ProductType } from '@/types/products';
import { Prisma, PrismaClient, Product } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withAccelerate());

interface ProductSummary {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string | null;
  categoryId: number;
  categoryName: string;
}

interface CategorySummary {
  id: number;
  categoryName: string;
}

// Interface para o corpo da requisição de criação de produto
interface CreateProductPayload {
  name: string;
  description: string; // Corrected to non-nullable
  price: number;
  stock: number;
  categoryId: number;
  image?: string | null;
}

// Interface for updating product payload
interface UpdateProductPayload {
  name?: string;
  description?: string; // Corrected to optional string, not null
  price?: number;
  stock?: number;
  categoryId?: number;
  image?: string | null;
}

export class ProductsService {
  /**
   * Fetches all products and formats them for the frontend.
   * Converts Decimal prices to numbers.
   * @returns A promise that resolves to an array of ProductSummary.
   */
  static async getAllProducts(): Promise<ProductSummary[]> {
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
        },
        cacheStrategy: { // Added cacheStrategy
          swr: 60,
          ttl: 60,
          tags: ['products'],
        },
      });

      const modifiedProducts: ProductSummary[] = products.map(product => {
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price instanceof Decimal ? product.price.toNumber() : Number(product.price),
          stock: product.stock,
          image: product.image,
          categoryId: product.categoryId,
          categoryName: product.category.categoryName
        };
      });

      return modifiedProducts;
    } finally {
      // await prisma.$disconnect(); // Removed to allow Accelerate to manage connections
    }
  }

  /**
   * Fetches all product categories.
   * @returns A promise that resolves to an array of CategorySummary.
   */
  static async getAllCategories(): Promise<CategorySummary[]> {
    try {
      const categories = await prisma.category.findMany({
        select: {
          id: true,
          categoryName: true,
        },
        cacheStrategy: { // Added cacheStrategy
          swr: 60,
          ttl: 60,
          tags: ['categories'],
        },
      });
      return categories;
    } finally {
      // await prisma.$disconnect(); // Removed to allow Accelerate to manage connections
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
        },
        cacheStrategy: { // Added cacheStrategy
          swr: 60,
          ttl: 60,
          tags: [`product-${id}`],
        },
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
      // await prisma.$disconnect(); // Removed to allow Accelerate to manage connections
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
          image: data.image,
        }
      });
      try {
        await prisma.$accelerate.invalidate({
          tags: ['products', 'categories'],
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === 'P6003') {
            console.log('The cache invalidation rate limit has been reached. Please try again later.');
          }
        }
        throw e; // Re-throw the error if it's not a rate limit issue
      }
      return newProduct;
    } finally {
      // await prisma.$disconnect(); // Removed to allow Accelerate to manage connections
    }
  }

  /**
   * Updates an existing product.
   * @param id The ID of the product to update.\n   * @param data The product data to update.\n   * @returns A promise that resolves to the updated Product.\n   */
  static async updateProduct(id: number, data: UpdateProductPayload): Promise<Product> {
    try {
      const updatedProduct = await prisma.product.update({
        where: { id: id },
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          stock: data.stock,
          categoryId: data.categoryId,
          image: data.image,
        },
      });
      try {
        await prisma.$accelerate.invalidate({
          tags: ['products', `product-${id}`, 'categories'],
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === 'P6003') {
            console.log('The cache invalidation rate limit has been reached. Please try again later.');
          }
        }
        throw e; // Re-throw the error if it's not a rate limit issue
      }
      return updatedProduct;
    } finally {
      // await prisma.$disconnect(); // Removed to allow Accelerate to manage connections
    }
  }

  static async getDashboardProductMetrics(lowStockThreshold: number = 10) {
    try {
      const totalProducts = await prisma.product.count();
      const lowStockProducts = await prisma.product.count({
        where: {
          stock: {
            lt: lowStockThreshold,
          },
        },
      });

      return {
        totalProducts,
        lowStockProducts,
        lowStockThreshold,
      };
    } finally {
      // await prisma.$disconnect(); // Removed to allow Accelerate to manage connections
    }
  }
}

