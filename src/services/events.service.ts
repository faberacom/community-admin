import { apiClient } from "@/src/lib/api-client";
import { AdminEventItem, AdminEventDetail, AdminEventListResponse, EventsQuery } from "@/src/types";

export const eventsService = {
  async list(params: EventsQuery = {}): Promise<AdminEventListResponse> {
    const query = new URLSearchParams();
    if (params.cursor) query.set("cursor", params.cursor);
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);
    // isDeleted must be stringified per API requirement
    if (params.isDeleted !== undefined)
      query.set("isDeleted", params.isDeleted ? "true" : "false");
    if (params.category) query.set("category", params.category);
    if (params.visibility) query.set("visibility", params.visibility);

    const response = await apiClient.get<AdminEventListResponse>(
      `/admin/events?${query}`,
    );
    return response.data;
  },

  async getById(id: string): Promise<AdminEventDetail> {
    const response = await apiClient.get<AdminEventDetail>(
      `/admin/events/${id}`,
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/events/${id}`);
  },
};
