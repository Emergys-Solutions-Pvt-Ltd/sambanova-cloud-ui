/** Normalized error shape for every failed API call. */
export interface ApiErrorShape {
  /** HTTP status, or 0 when the request never got a response (network, timeout, abort). */
  status: number;
  /** Stable machine-readable code, e.g. `NOT_FOUND`, `NETWORK_ERROR`. */
  code: string;
  message: string;
  details?: unknown;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/** Envelope for paginated list endpoints. `page` is 1-based. */
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
