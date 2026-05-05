"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { useAuthStore } from "@/src/stores";
import { authService } from "@/src/services/auth.service";
import { getAccessToken, removeAuthTokens } from "@/src/lib/api-client";
import { AdminUser, LoginCredentials } from "@/src/types";

interface AuthContextType {
  user: AdminUser | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const {
    user,
    setUser,
    setIsLoadingState,
    logout: clearAuth,
  } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAccessToken();

      if (!token) {
        setIsLoadingState(false);
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        removeAuthTokens();
        clearAuth();
      } finally {
        setIsLoadingState(false);
      }
    };

    initializeAuth();
  }, [setUser, setIsLoadingState, clearAuth]);

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    setUser(response.user);
  };

  const logout = async () => {
    removeAuthTokens();
    clearAuth();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
