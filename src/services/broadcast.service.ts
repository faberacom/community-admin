import { apiClient } from "@/src/lib/api-client";
import { AdminRole } from "@/src/types";

export interface BroadcastRequest {
  subject: string;
  body: string;
  filter?: {
    role?: AdminRole;
    isActive?: boolean;
  };
}

export interface BroadcastResponse {
  sent: number;
}

export const broadcastService = {
  async send(payload: BroadcastRequest): Promise<BroadcastResponse> {
    const response = await apiClient.post<BroadcastResponse>(
      "/admin/broadcast",
      payload,
    );
    return response.data;
  },
};
