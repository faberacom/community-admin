export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface PaginationQuery {
  cursor?: string;
  limit?: number;
}

export interface MediaResponse {
  id: string;
  mediaUrl: string;
  mediaType: string;
}
