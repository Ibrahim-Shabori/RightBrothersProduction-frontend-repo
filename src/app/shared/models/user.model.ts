export interface UserEffectDto {
  userId: string;
  userName: string;
  imageURL: string;
  requestsGotVotes: number;
  receivedVotesCount: number;
}

export interface UserCountStatDto {
  regularUsersCount: number;
  adminUsersCount: number;
}

export interface banStatusDto {
  isBanned: boolean;
}

export interface UserManagementPageItemDto {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  joinedAt: Date;
  profilePictureUrl: string;
  performanceScore: number;
  lastActivity: Date;
}
