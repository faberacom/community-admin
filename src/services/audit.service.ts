import { apiClient } from "@/src/lib/api-client";
import { AuditLogListResponse, AuditQuery } from "@/src/types";

export const auditService = {
  async list(params: AuditQuery = {}): Promise<AuditLogListResponse> {
    const query = new URLSearchParams();
    if (params.cursor) query.set("cursor", params.cursor);
    if (params.limit) query.set("limit", String(params.limit));
    if (params.adminId) query.set("adminId", params.adminId);
    if (params.action) query.set("action", params.action);
    if (params.resourceType) query.set("resourceType", params.resourceType);
    if (params.from) query.set("from", params.from);
    if (params.to) query.set("to", params.to);

    const response = await apiClient.get<AuditLogListResponse>(
      `/admin/audit?${query}`,
    );
    return response.data;
  },
};
