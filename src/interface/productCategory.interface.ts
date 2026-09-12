import type { Optional } from 'sequelize';

export interface ProductCategoryAttributes {
  id: string;
  client_id: string;
  category_name: string;
  category_code: string | null;
  description: string | null;
  status: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export type ProductCategoryCreationAttributes = Optional<
  ProductCategoryAttributes,
  'id' | 'category_code' | 'description' | 'status' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export interface CreateProductCategoryDTO {
  category_name: string;
  category_code?: string | null;
  description?: string | null;
  status?: boolean;
}

export interface UpdateProductCategoryDTO {
  category_name?: string;
  category_code?: string | null;
  description?: string | null;
  status?: boolean;
}

export interface ProductCategoryQuery {
  page?: number;
  limit?: number;
  status?: boolean;
}
