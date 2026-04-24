"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuthStore } from "@/src/stores";
import { useAuth } from "@/src/contexts/auth.context";
import { DropdownMenu } from "@/src/components/ui/dropdown-menu";
import { getMediaUrl } from "@/src/utils/functions";
import { isSuperAdmin } from "@/src/types";
import LogoutIcon from "@/public/icons/logout-icon.svg";
import UserIcon from "@/public/icons/user.svg";

interface TopbarProps {
  onMenuOpen: () => void;
}

export function Topbar({ onMenuOpen }: TopbarProps) {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/login");
    } catch {
      toast.error("Failed to log out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const avatarUrl = user?.profileImageUrl
    ? getMediaUrl(user.profileImageUrl)
    : null;

  const roleLabel = isSuperAdmin(user) ? "Super Admin" : "Admin";

  return (
    <header className="h-14 shrink-0 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6">
      {/* Left: hamburger (mobile) + breadcrumb */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuOpen}
          className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <rect x="2" y="4" width="16" height="2" rx="1" />
            <rect x="2" y="9" width="16" height="2" rx="1" />
            <rect x="2" y="14" width="16" height="2" rx="1" />
          </svg>
        </button>
        <span className="text-sm text-gray-400">Nigerian Community</span>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-700">Admin</span>
      </div>

      {/* Right: User menu */}
      <DropdownMenu
        trigger={
          <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 shrink-0">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={user?.displayName || user?.username || "Admin"}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <UserIcon className="w-4 h-4 text-primary" />
                </div>
              )}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-gray-900 leading-tight">
                {user?.displayName || user?.username}
              </p>
              <p className="text-xs text-gray-400">{roleLabel}</p>
            </div>
          </button>
        }
        items={[
          {
            label: isLoggingOut ? "Logging out..." : "Log out",
            icon: <LogoutIcon className="w-4 h-4" />,
            onClick: handleLogout,
            variant: "danger",
          },
        ]}
        align="right"
      />
    </header>
  );
}
