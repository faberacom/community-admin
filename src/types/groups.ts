import { PaginatedResponse } from "./api";

export interface AdminGroupCreator {
  id: string;
  username: string;
}

export interface AdminGroupSettings {
  allowMemberInvites: boolean;
  requirePostApproval: boolean;
  allowMemberPosts: boolean;
  autoApproveMembers: boolean;
}

export interface AdminGroup {
  id: string;
  name: string;
  category: string;
  visibility: "PUBLIC" | "PRIVATE";
  isApproved: boolean;
  isDeleted: boolean;
  createdAt: string;
  creator: AdminGroupCreator;
  memberCount: number;
  postCount: number;
}

export interface AdminGroupDetail extends AdminGroup {
  description?: string;
  contentAccess: "PUBLIC" | "PRIVATE";
  logoUrl?: string;
  coverImageUrl?: string;
  settings?: AdminGroupSettings;
  eventCount: number;
}

export interface AdminGroupApprovalResponse {
  id: string;
  name: string;
  isApproved: boolean;
}

export type AdminGroupListResponse = PaginatedResponse<AdminGroup>;

export interface GroupsQuery {
  cursor?: string;
  limit?: number;
  search?: string;
  isApproved?: boolean;
}
