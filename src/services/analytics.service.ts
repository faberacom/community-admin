import { apiClient } from "@/src/lib/api-client";
import {
  OverviewStats,
  UserAnalytics,
  ContentAnalytics,
  RevenueAnalytics,
} from "@/src/types";

export const analyticsService = {
  async getOverview(): Promise<OverviewStats> {
    const response = await apiClient.get<OverviewStats>(
      "/admin/analytics/overview",
    );
    return response.data;
  },

  async getUserAnalytics(): Promise<UserAnalytics> {
    const response = await apiClient.get<UserAnalytics>(
      "/admin/analytics/users",
    );
    return response.data;
  },

  async getContentAnalytics(): Promise<ContentAnalytics> {
    const response = await apiClient.get<ContentAnalytics>(
      "/admin/analytics/content",
    );
    return response.data;
  },

  async getRevenueAnalytics(): Promise<RevenueAnalytics> {
    const response = await apiClient.get<RevenueAnalytics>(
      "/admin/analytics/revenue",
    );
    return response.data;
  },
};
