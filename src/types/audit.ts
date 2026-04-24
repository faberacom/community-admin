import { PaginatedResponse } from "./api";

export interface AuditLog {
  id: string;
  adminId: string;
  adminUsername: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type AuditLogListResponse = PaginatedResponse<AuditLog>;

export interface AuditQuery {
  cursor?: string;
  limit?: number;
  adminId?: string;
  action?: string;
  resourceType?: string;
  from?: string;
  to?: string;
}
