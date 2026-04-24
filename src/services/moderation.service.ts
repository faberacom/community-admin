import { apiClient } from "@/src/lib/api-client";
import {
  Report,
  ReportListResponse,
  ReportsQuery,
  ReportStatus,
  ModerationActionType,
} from "@/src/types";

export const moderationService = {
  async list(params: ReportsQuery = {}): Promise<ReportListResponse> {
    const query = new URLSearchParams();
    if (params.cursor) query.set("cursor", params.cursor);
    if (params.limit) query.set("limit", String(params.limit));
    if (params.status) query.set("status", params.status);
    if (params.targetType) query.set("targetType", params.targetType);
    if (params.reason) query.set("reason", params.reason);

    const response = await apiClient.get<ReportListResponse>(
      `/admin/moderation/reports?${query}`,
    );
    return response.data;
  },

  async getById(id: string): Promise<Report> {
    const response = await apiClient.get<Report>(
      `/admin/moderation/reports/${id}`,
    );
    return response.data;
  },

  async updateStatus(id: string, status: ReportStatus): Promise<Report> {
    const response = await apiClient.patch<Report>(
      `/admin/moderation/reports/${id}/status`,
      { status },
    );
    return response.data;
  },

  async takeAction(
    id: string,
    action_type: ModerationActionType,
    notes?: string,
  ): Promise<Report> {
    const response = await apiClient.post<Report>(
      `/admin/moderation/reports/${id}/action`,
      { action_type, notes },
    );
    return response.data;
  },
};
