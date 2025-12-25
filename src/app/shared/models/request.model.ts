// 1. The Enum (Matches your C# Enum)
export enum RequestType {
  Regular = 0,
  Detailed = 1,
  Bug = 2,
  DetailedBug = 3,
}

// 2. The Category Interface (Matches your C# DTO)
export interface Category {
  id: number;
  name: string;
  description: string;
  requestType: RequestType;
}

export enum RequestStatus {
  UnderReview = 0,
  Published = 1,
  InConsideration = 2,
  InProgress = 3,
  Done = 4,
}

export interface RequestResponseDto {
  id: number;
  title: string;
  description: string;
  status: RequestStatus;
  createdAt: Date;
  votesCount: number;
  type: RequestType;
  categoryId: number;

  categoryName: string;
  createdByName?: string;

  isVotedByCurrentUser: boolean;

  isDetailed?: boolean;
}
