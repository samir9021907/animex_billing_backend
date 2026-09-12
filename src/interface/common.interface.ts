export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error: unknown | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface IdParam {
  id: string;
}

export interface StatusQuery {
  status?: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}
