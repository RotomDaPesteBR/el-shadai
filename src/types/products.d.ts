export interface ProductType {
  id: number;
  name: string;
  description: string;
  price: number; // <--- CHANGE THIS FROM Decimal TO number
  stock: number;
  image?: string | null;
  categoryId: number;
  categoryName: string;
  // If you had createdAt or updatedAt and are omitting them, ensure they are not here
  // or are explicitly marked as optional or removed from the type.
}

type GroupedProducts = {
  [id: number]: Array<ProductType>;
};
