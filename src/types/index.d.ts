import { ProductType } from "./products";

export interface CategorySummary {
  id: number;
  categoryName: string;
}

export interface CartItem extends ProductType {
  quantity: number;
}
