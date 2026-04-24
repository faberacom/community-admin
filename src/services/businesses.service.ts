import { apiClient } from "@/src/lib/api-client";
import {
  AdminBusiness,
  AdminBusinessDetail,
  AdminBusinessListResponse,
  AdminBusinessToggleResponse,
  BusinessesQuery,
} from "@/src/types";

export const businessesService = {
  async list(params: BusinessesQuery = {}): Promise<AdminBusinessListResponse> {
    const query = new URLSearchParams();
    if (params.cursor) query.set("cursor", params.cursor);
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);
    if (params.category) query.set("category", params.category);
    if (params.isVerified !== undefined)
      query.set("isVerified", String(params.isVerified));

    const response = await apiClient.get<AdminBusinessListResponse>(
      `/admin/businesses?${query}`,
    );
    return response.data;
  },

  async getById(id: string): Promise<AdminBusinessDetail> {
    const response = await apiClient.get<AdminBusinessDetail>(
      `/admin/businesses/${id}`,
    );
    return response.data;
  },

  async setVerified(
    id: string,
    verified: boolean,
  ): Promise<AdminBusinessToggleResponse> {
    const response = await apiClient.patch<AdminBusinessToggleResponse>(
      `/admin/businesses/${id}/verify`,
      { verified },
    );
    return response.data;
  },

  async setFeatured(
    id: string,
    featured: boolean,
  ): Promise<AdminBusinessToggleResponse> {
    const response = await apiClient.patch<AdminBusinessToggleResponse>(
      `/admin/businesses/${id}/feature`,
      { featured },
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/businesses/${id}`);
  },
};
