import { AdminRole, PaginatedResponse } from ".";

export interface ManagedUserProfile {
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface ManagedUser {
  id: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  banReason?: string;
  isEmailVerified: boolean;
  createdAt: string;
  profile?: ManagedUserProfile;
}

export interface ManagedUserDetail extends ManagedUser {
  stats: {
    postCount: number;
    commentCount: number;
    groupCount: number;
    businessCount: number;
    reportCount: number;
  };
}

export type UserListResponse = PaginatedResponse<ManagedUser>;

export interface UserListFilters {
  search?: string;
  role?: AdminRole | "";
  isActive?: boolean | "";
}
