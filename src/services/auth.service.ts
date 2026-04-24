import {
  apiClient,
  setAuthTokens,
  removeAuthTokens,
} from "@/src/lib/api-client";
import { AuthResponse, LoginCredentials, AdminUser, isAdmin } from "@/src/types";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials,
    );

    const { accessToken, refreshToken, user } = response.data;

    if (!isAdmin(user)) {
      throw new Error("Access denied. Admin privileges required.");
    }

    setAuthTokens(accessToken, refreshToken);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      removeAuthTokens();
    }
  },

  async getCurrentUser(): Promise<AdminUser> {
    const response = await apiClient.get<AdminUser>("/users/me");

    if (!isAdmin(response.data)) {
      removeAuthTokens();
      throw new Error("Access denied. Admin privileges required.");
    }

    return response.data;
  },
};
