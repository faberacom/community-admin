import { apiClient } from "@/src/lib/api-client";
import {
  AdminVerificationDetail,
  AdminVerificationListResponse,
  VerificationsQuery,
} from "@/src/types";

export const businessVerificationsService = {
  async list(
    params: VerificationsQuery = {},
  ): Promise<AdminVerificationListResponse> {
    const query = new URLSearchParams();
    if (params.cursor) query.set("cursor", params.cursor);
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);
    if (params.status) query.set("status", params.status);

    const response = await apiClient.get<AdminVerificationListResponse>(
      `/admin/verifications?${query}`,
    );
    return response.data;
  },

  async getById(id: string): Promise<AdminVerificationDetail> {
    const response = await apiClient.get<AdminVerificationDetail>(
      `/admin/verifications/${id}`,
    );
    return response.data;
  },

  async review(
    id: string,
    body: { action: "APPROVE" | "REJECT"; notes?: string },
  ): Promise<void> {
    await apiClient.patch(`/admin/verifications/${id}/review`, body);
  },
};
