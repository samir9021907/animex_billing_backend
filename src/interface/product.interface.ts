import type { Optional } from 'sequelize';

export type ProductUnit = 'Ltr' | 'ml' | 'Kg' | 'gm' | 'Piece' | 'Box' | 'Bottle' | 'Strip' | 'Tablet';

export interface ProductAttributes {
  id: string;
  client_id: string;
  category_id: string;
  product_title: string;
  unit: ProductUnit;
  mrp: string;
  selling_price: string;
  status: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export type ProductCreationAttributes = Optional<
  ProductAttributes,
  'id' | 'status' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export interface CreateProductDTO {
  category_id: string;
  product_title: string;
  unit: ProductUnit;
  mrp: string | number;
  selling_price: string | number;
  status?: boolean;
}

export interface UpdateProductDTO {
  category_id?: string;
  product_title?: string;
  unit?: ProductUnit;
  mrp?: string | number;
  selling_price?: string | number;
  status?: boolean;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  category_id?: string;
  status?: boolean;
}
