import { apiClient } from "@/src/lib/api-client";
import {
  ManagedUser,
  ManagedUserDetail,
  UserListResponse,
  AdminRole,
} from "@/src/types";

export interface UsersQuery {
  cursor?: string;
  limit?: number;
  search?: string;
  role?: AdminRole | "";
  isActive?: boolean | "";
}

export const usersService = {
  async list(params: UsersQuery = {}): Promise<UserListResponse> {
    const query = new URLSearchParams();
    if (params.cursor) query.set("cursor", params.cursor);
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);
    if (params.role) query.set("role", params.role);
    if (params.isActive !== "" && params.isActive !== undefined)
      query.set("isActive", String(params.isActive));

    const response = await apiClient.get<UserListResponse>(
      `/admin/users?${query}`,
    );
    return response.data;
  },

  async getById(id: string): Promise<ManagedUserDetail> {
    const response = await apiClient.get<ManagedUserDetail>(`/admin/users/${id}`);
    return response.data;
  },

  async changeRole(id: string, role: AdminRole): Promise<ManagedUser> {
    const response = await apiClient.patch<ManagedUser>(
      `/admin/users/${id}/role`,
      { role },
    );
    return response.data;
  },

  async ban(id: string, reason: string): Promise<ManagedUser> {
    const response = await apiClient.patch<ManagedUser>(
      `/admin/users/${id}/ban`,
      { reason },
    );
    return response.data;
  },

  async unban(id: string): Promise<ManagedUser> {
    const response = await apiClient.patch<ManagedUser>(
      `/admin/users/${id}/unban`,
      {},
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/users/${id}`);
  },
};
