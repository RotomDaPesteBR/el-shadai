import { prisma } from '@/prisma';
import { ProductType } from '@/types/products';
import { Product } from '@prisma/client';

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

interface LowStockProductSummary {
  id: number;
  name: string;
  stock: number;
  image?: string | null;
}

// Interface para o corpo da requisição de criação de produto
interface CreateProductPayload {
  name: string;
  description: string;
  price: number;
  stock: number;
  minimumStock?: number;
  categoryId: number;
  image?: string | null;
}

// Interface for updating product payload
interface UpdateProductPayload {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  minimumStock?: number;
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
        }
      });

      const modifiedProducts: ProductSummary[] = products.map(product => {
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price.toNumber(),
          stock: product.stock,
          image: product.image,
          categoryId: product.categoryId,
          categoryName: product.category.categoryName
        };
      });

      return modifiedProducts;
    } finally {
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
          categoryName: true
        }
      });
      return categories;
    } finally {
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
        price: price.toNumber(),
        categoryName: category.categoryName
      };

      return modifiedProduct;
    } finally {
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
          minimumStock: data.minimumStock,
          categoryId: data.categoryId,
          image: data.image
        }
      });

      return newProduct;
    } finally {
    }
  }

  /**
   * Updates an existing product.
   * @param id The ID of the product to update.\n   * @param data The product data to update.\n   * @returns A promise that resolves to the updated Product.\n   */
  static async updateProduct(
    id: number,
    data: UpdateProductPayload
  ): Promise<Product> {
    try {
      const updatedProduct = await prisma.product.update({
        where: { id: id },
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          stock: data.stock,
          minimumStock: data.minimumStock,
          categoryId: data.categoryId,
          image: data.image
        }
      });

      return updatedProduct;
    } finally {
    }
  }

  static async getDashboardProductMetrics() {
    try {
      const allProducts = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          stock: true,
          minimumStock: true,
          image: true
        }
      });

      const lowStockProductsList = allProducts
        .filter(p => p.stock <= p.minimumStock)
        .map(({ minimumStock, ...rest }) => rest); // Remove minimumStock from the final list

      return {
        totalProducts: allProducts.length,
        lowStockProducts: lowStockProductsList // Return the filtered list
      };
    } finally {
    }
  }

  /**
   * Deletes a product by its ID.
   * @param productId The ID of the product to delete.
   * @returns A promise that resolves to the deleted Product.
   */
  static async deleteProduct(productId: number): Promise<Product> {
    try {
      const deletedProduct = await prisma.product.delete({
        where: { id: productId }
      });
      return deletedProduct;
    } finally {
    }
  }

  /**
   * Updates the stock of a product.
   * @param productId The ID of the product to update.
   * @param newStock The new stock quantity.
   * @returns A promise that resolves to the updated Product.
   */
  static async updateProductStock(
    productId: number,
    newStock: number
  ): Promise<Product> {
    try {
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: { stock: newStock }
      });
      return updatedProduct;
    } finally {
    }
  }
}

