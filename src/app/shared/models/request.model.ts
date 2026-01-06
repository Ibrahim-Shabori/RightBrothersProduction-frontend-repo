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
  requestType: RequestType;
  color: string;
  isActive: boolean;
  displayOrder: number;
}

export enum RequestStatus {
  Rejected = 0,
  UnderReview = 1,
  Published = 2,
  InConsideration = 3,
  InProgress = 4,
  Done = 5,
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

export interface RequestPageItemDto {
  id: number;
  title: string;
  description: string;
  shortDescription: string;
  createdAt: Date;
  type: RequestType;
  categoryId: number;
  createdBy: string;
  createdByProfilePicture: string;
  isDetailed?: boolean;
}

export interface RequestManagementPageItemDto {
  id: number;
  title: string;
  description: string;
  type: RequestType;
  status: RequestStatus;
  isDetailed?: boolean;
  votesCount: number;
  trendsCount: number;
  lastUpdatedAt: Date;
  createdBy: string;
  logs: RequestLogForAdminsDto[];
}

export interface NotAssignedRequestDto {
  requestId: number;
  title: string;
  type: RequestType;
  createdBy: string;
  createdAt: Date;
}

export interface CreateRequestLogDto {
  requestId: number;
  newStatus: RequestStatus;
  comment: string;
  isPublic: boolean;
}

export interface RequestLogDto {
  newStatus: RequestStatus;
  comment: string;
  createdAt: Date;
}

export interface RequestLogForAdminsDto {
  newStatus: RequestStatus;
  comment: string;
  createdAt: Date;
  isPublic: boolean;
}

export interface ReviewRequestDto {
  newStatus: RequestStatus;
  comment: string;
  isPublic: boolean;
}
