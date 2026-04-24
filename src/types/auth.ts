export type AdminRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: AdminRole;
  displayName?: string;
  profileImageUrl?: string;
  isEmailVerified: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AdminUser;
  refreshToken: string;
  accessToken: string;
}

export function isAdmin(user: AdminUser | null): boolean {
  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
}

export function isSuperAdmin(user: AdminUser | null): boolean {
  return user?.role === "SUPER_ADMIN";
}
