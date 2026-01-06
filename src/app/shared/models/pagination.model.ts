export interface Pagination {
  CurrentPage: number;
  PageSize: number;
  TotalCount: number;
  TotalPages: number;
  HasPrevious: boolean;
  HasNext: boolean;
}

export class PaginatedResult<T> {
  result?: T; // The actual data (e.g., Request[])
  pagination?: Pagination; // The header data
}
