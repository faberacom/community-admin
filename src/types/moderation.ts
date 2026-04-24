import { PaginatedResponse } from "./api";

export type ReportStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";
export type TargetType = "POST" | "COMMENT" | "USER" | "BUSINESS" | "GROUP";
export type ReportReason =
  | "SPAM"
  | "HARASSMENT"
  | "HATE"
  | "MISINFORMATION"
  | "OTHER";
export type ModerationActionType =
  | "WARN"
  | "DELETE_POST"
  | "DELETE_COMMENT"
  | "BAN_USER"
  | "FEATURE_BUSINESS"
  | "UNFEATURE_BUSINESS";

export interface ModerationAction {
  id: string;
  reportId: string;
  adminId: string;
  adminUsername: string;
  actionType: ModerationActionType;
  notes?: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterUsername: string;
  targetType: TargetType;
  targetId: string;
  target?: unknown;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  actions: ModerationAction[];
  createdAt: string;
  updatedAt: string;
}

export type ReportListResponse = PaginatedResponse<Report>;

export interface ReportsQuery {
  cursor?: string;
  limit?: number;
  status?: ReportStatus | "";
  targetType?: TargetType | "";
  reason?: ReportReason | "";
}
