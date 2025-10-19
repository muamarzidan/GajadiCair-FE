export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data: T;
  errors: any;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}