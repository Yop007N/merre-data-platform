export interface Result<T> {
  success: boolean;
  data?: T;
  error?: ErrorDetails;
}

export interface ErrorDetails {
  code: string;
  message: string;
  details?: any;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface QueryFilters {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export class Success<T> implements Result<T> {
  success = true as const;

  constructor(public data: T) {}
}

export class Failure<T> implements Result<T> {
  success = false as const;

  constructor(public error: ErrorDetails) {}
}

export const createSuccess = <T>(data: T): Result<T> => new Success(data);

export const createFailure = <T>(error: ErrorDetails): Result<T> => new Failure(error);

export const createError = (code: string, message: string, details?: any): ErrorDetails => ({
  code,
  message,
  details
});