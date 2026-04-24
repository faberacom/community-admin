import { apiClient } from "@/src/lib/api-client";
import {
  AdminGroup,
  AdminGroupDetail,
  AdminGroupListResponse,
  AdminGroupApprovalResponse,
  GroupsQuery,
} from "@/src/types";

export const groupsService = {
  async list(params: GroupsQuery = {}): Promise<AdminGroupListResponse> {
    const query = new URLSearchParams();
    if (params.cursor) query.set("cursor", params.cursor);
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);
    if (params.isApproved !== undefined)
      query.set("isApproved", String(params.isApproved));

    const response = await apiClient.get<AdminGroupListResponse>(
      `/admin/groups?${query}`,
    );
    return response.data;
  },

  async getById(id: string): Promise<AdminGroupDetail> {
    const response = await apiClient.get<AdminGroupDetail>(
      `/admin/groups/${id}`,
    );
    return response.data;
  },

  async approve(id: string): Promise<AdminGroupApprovalResponse> {
    const response = await apiClient.patch<AdminGroupApprovalResponse>(
      `/admin/groups/${id}/approve`,
    );
    return response.data;
  },

  async reject(id: string): Promise<AdminGroupApprovalResponse> {
    const response = await apiClient.patch<AdminGroupApprovalResponse>(
      `/admin/groups/${id}/reject`,
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/groups/${id}`);
  },
};
