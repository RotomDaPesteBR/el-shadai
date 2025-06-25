import { Product } from '@prisma/client';

export type ProductType = Omit<Product, 'createdAt' | 'updatedAt'> & {
  categoryName: string | null;
};

type GroupedProducts = {
  [id: number]: Array<ProductType>;
};
