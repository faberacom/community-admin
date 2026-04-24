"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-toastify";
import { usersService } from "@/src/services/users.service";
import { ManagedUser, ManagedUserDetail, AdminRole, isSuperAdmin } from "@/src/types";
import { useAuthStore } from "@/src/stores";
import { RoleBadge } from "./role-badge";
import { StatusBadge } from "./status-badge";
import { BanModal } from "./ban-modal";
import { ChangeRoleModal } from "./change-role-modal";
import { ConfirmModal } from "@/src/components/ui/confirm-modal";
import { Button } from "@/src/components/ui/button";
import { getMediaUrl } from "@/src/utils/functions";
import { formatDate } from "@/src/utils/date";
import UserIcon from "@/public/icons/user.svg";
import FeedIcon from "@/public/icons/feed.svg";
import CommentIcon from "@/public/icons/comment-icon.svg";
import GroupsIcon from "@/public/icons/groups.svg";
import BusinessIcon from "@/public/icons/business.svg";
import ReportIcon from "@/public/icons/report-icon.svg";

interface UserDetailViewProps {
  userId: string;
}

function StatBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

export function UserDetailView({ userId }: UserDetailViewProps) {
  const [user, setUser] = useState<ManagedUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBan, setShowBan] = useState(false);
  const [showRole, setShowRole] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const { user: currentAdmin } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    usersService
      .getById(userId)
      .then(setUser)
      .catch(() => toast.error("Failed to load user"))
      .finally(() => setIsLoading(false));
  }, [userId]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-5 w-40 bg-gray-200 rounded" />
            <div className="h-4 w-28 bg-gray-100 rounded" />
            <div className="h-4 w-48 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 h-16" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 text-gray-400">User not found.</div>
    );
  }

  const username = user.profile?.username ?? "—";
  const displayName = user.profile?.displayName;
  const avatarUrl = user.profile?.avatarUrl
    ? getMediaUrl(user.profile.avatarUrl)
    : null;

  const canChangeRole =
    user.role !== "SUPER_ADMIN" || isSuperAdmin(currentAdmin);

  const handleBan = async (reason: string) => {
    const updated = await usersService.ban(user.id, reason);
    setUser((prev) => prev && { ...prev, ...updated });
    toast.success(`@${username} has been banned`);
  };

  const handleUnban = async () => {
    const updated = await usersService.unban(user.id);
    setUser((prev) => prev && { ...prev, ...updated });
    toast.success(`@${username} has been unbanned`);
  };

  const handleChangeRole = async (role: AdminRole) => {
    const updated = await usersService.changeRole(user.id, role);
    setUser((prev) => prev && { ...prev, ...updated });
    toast.success(`Role updated to ${role.replace("_", " ")}`);
  };

  const handleDelete = async () => {
    await usersService.delete(user.id);
    toast.success("User account deleted");
    router.push("/users");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 shrink-0">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={username}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <UserIcon className="w-7 h-7 text-primary" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {displayName ?? `@${username}`}
                </h2>
                {displayName && (
                  <p className="text-sm text-gray-400">@{username}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <RoleBadge role={user.role} />
                <StatusBadge isActive={user.isActive} banReason={user.banReason} />
              </div>
            </div>
            <div className="mt-3 space-y-1 text-sm text-gray-500">
              <p>{user.email}</p>
              <p>Joined {formatDate(user.createdAt)}</p>
              {!user.isEmailVerified && (
                <p className="text-amber-600 text-xs">Email not verified</p>
              )}
              {user.banReason && (
                <p className="text-red-600 text-xs">
                  Ban reason: {user.banReason}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Activity
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatBox
            icon={<FeedIcon className="w-4 h-4 text-primary" />}
            label="Posts"
            value={user.stats.postCount}
          />
          <StatBox
            icon={<CommentIcon className="w-4 h-4 text-blue-500" />}
            label="Comments"
            value={user.stats.commentCount}
          />
          <StatBox
            icon={<GroupsIcon className="w-4 h-4 text-amber-500" />}
            label="Groups"
            value={user.stats.groupCount}
          />
          <StatBox
            icon={<BusinessIcon className="w-4 h-4 text-teal-500" />}
            label="Businesses"
            value={user.stats.businessCount}
          />
          <StatBox
            icon={<ReportIcon className="w-4 h-4 text-red-500" />}
            label="Reports"
            value={user.stats.reportCount}
          />
        </div>
      </div>

      {/* Actions */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Actions
        </h3>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-wrap gap-3">
          {canChangeRole && (
            <Button variant="outline" size="sm" onClick={() => setShowRole(true)}>
              Change role
            </Button>
          )}
          {user.isActive ? (
            <Button variant="outline" size="sm" onClick={() => setShowBan(true)}>
              Ban user
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleUnban}>
              Unban user
            </Button>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDelete(true)}
          >
            Delete account
          </Button>
        </div>
      </div>

      {/* Modals */}
      <BanModal
        isOpen={showBan}
        onClose={() => setShowBan(false)}
        username={username}
        onConfirm={handleBan}
      />
      <ChangeRoleModal
        isOpen={showRole}
        onClose={() => setShowRole(false)}
        username={username}
        currentRole={user.role}
        targetRole={user.role}
        onConfirm={handleChangeRole}
      />
      <ConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete account"
        message={`This will permanently delete @${username}'s account and all their data. This cannot be undone.`}
        confirmLabel="Delete account"
        variant="danger"
      />
    </div>
  );
}
