import { apiClient } from "@/src/lib/api-client";
import {
  AdListResponse,
  AdPricingResponse,
  AdResponse,
  AdStatsResponse,
  AdsQuery,
} from "@/src/types";

export const adsService = {
  async list(params: AdsQuery = {}): Promise<AdListResponse> {
    const query = new URLSearchParams();
    if (params.cursor) query.set("cursor", params.cursor);
    if (params.limit) query.set("limit", String(params.limit));
    if (params.source) query.set("source", params.source);
    if (params.status) query.set("status", params.status);
    if (params.placement) query.set("placement", params.placement);
    if (params.isActive !== undefined)
      query.set("isActive", String(params.isActive));

    const response = await apiClient.get<AdListResponse>(`/admin/ads?${query}`);
    return response.data;
  },

  async getById(id: string): Promise<AdResponse> {
    const response = await apiClient.get<AdResponse>(`/admin/ads/${id}`);
    return response.data;
  },

  async create(body: {
    title: string;
    description?: string;
    image_url?: string;
    target_url?: string;
    placement: string;
    starts_at?: string;
    ends_at?: string;
  }): Promise<AdResponse> {
    const response = await apiClient.post<AdResponse>("/admin/ads", body);
    return response.data;
  },

  async update(
    id: string,
    body: {
      title?: string;
      description?: string;
      image_url?: string;
      target_url?: string;
      placement?: string;
      starts_at?: string;
      ends_at?: string;
    },
  ): Promise<AdResponse> {
    const response = await apiClient.patch<AdResponse>(
      `/admin/ads/${id}`,
      body,
    );
    return response.data;
  },

  async toggle(id: string): Promise<AdResponse> {
    const response = await apiClient.patch<AdResponse>(
      `/admin/ads/${id}/toggle`,
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/ads/${id}`);
  },

  async review(
    id: string,
    body: { action: "APPROVE" | "REJECT"; rejectionNotes?: string },
  ): Promise<void> {
    await apiClient.patch(`/admin/ads/${id}/review`, body);
  },

  async getStats(id: string): Promise<AdStatsResponse> {
    const response = await apiClient.get<AdStatsResponse>(
      `/admin/ads/${id}/stats`,
    );
    return response.data;
  },

  async listPricing(): Promise<AdPricingResponse[]> {
    const response =
      await apiClient.get<AdPricingResponse[]>("/admin/ads/pricing");
    return response.data;
  },

  async createPricing(body: {
    placement: string;
    duration_days: number;
    price: number;
  }): Promise<AdPricingResponse> {
    const response = await apiClient.post<AdPricingResponse>(
      "/admin/ads/pricing",
      body,
    );
    return response.data;
  },

  async updatePricing(
    id: string,
    body: { price?: number; is_active?: boolean },
  ): Promise<AdPricingResponse> {
    const response = await apiClient.patch<AdPricingResponse>(
      `/admin/ads/pricing/${id}`,
      body,
    );
    return response.data;
  },

  async deletePricing(id: string): Promise<void> {
    await apiClient.delete(`/admin/ads/pricing/${id}`);
  },
};
