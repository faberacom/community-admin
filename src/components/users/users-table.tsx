"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import { ManagedUser, AdminRole, isSuperAdmin } from "@/src/types";
import { usersService } from "@/src/services/users.service";
import { useAuthStore } from "@/src/stores";
import { RoleBadge } from "./role-badge";
import { StatusBadge } from "./status-badge";
import { BanModal } from "./ban-modal";
import { ChangeRoleModal } from "./change-role-modal";
import { ConfirmModal } from "@/src/components/ui/confirm-modal";
import { DropdownMenu } from "@/src/components/ui/dropdown-menu";
import { getMediaUrl } from "@/src/utils/functions";
import { formatDate } from "@/src/utils/date";
import UserIcon from "@/public/icons/user.svg";
import KebabMenuIcon from "@/public/icons/kebab-menu-icon.svg";
import EditIcon from "@/public/icons/edit-icon.svg";
import TrashIcon from "@/public/icons/trash-icon.svg";
import ReportIcon from "@/public/icons/report-icon.svg";

interface UsersTableProps {
  users: ManagedUser[];
  onUpdate: (updated: ManagedUser) => void;
  onDelete: (id: string) => void;
}

export function UsersTable({ users, onUpdate, onDelete }: UsersTableProps) {
  const { user: currentAdmin } = useAuthStore();

  const [banTarget, setBanTarget] = useState<ManagedUser | null>(null);
  const [roleTarget, setRoleTarget] = useState<ManagedUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);

  const handleBan = async (reason: string) => {
    if (!banTarget) return;
    const updated = await usersService.ban(banTarget.id, reason);
    onUpdate(updated);
    toast.success(`@${banTarget.profile?.username} has been banned`);
  };

  const handleUnban = async (user: ManagedUser) => {
    const updated = await usersService.unban(user.id);
    onUpdate(updated);
    toast.success(`@${user.profile?.username} has been unbanned`);
  };

  const handleChangeRole = async (role: AdminRole) => {
    if (!roleTarget) return;
    const updated = await usersService.changeRole(roleTarget.id, role);
    onUpdate(updated);
    toast.success(`Role updated to ${role.replace("_", " ")}`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await usersService.delete(deleteTarget.id);
    onDelete(deleteTarget.id);
    toast.success("User account deleted");
  };

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <p className="text-gray-400 text-sm">No users found</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Email
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Joined
                </th>
                <th className="px-4 py-3.5 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => {
                const username = user.profile?.username ?? "—";
                const displayName = user.profile?.displayName;
                const avatarUrl = user.profile?.avatarUrl
                  ? getMediaUrl(user.profile.avatarUrl)
                  : null;

                const canChangeRole =
                  user.role !== "SUPER_ADMIN" ||
                  isSuperAdmin(currentAdmin);

                const menuItems = [
                  {
                    label: "View details",
                    icon: <UserIcon className="w-4 h-4" />,
                    onClick: () => {},
                    href: `/users/${user.id}`,
                  },
                  ...(canChangeRole
                    ? [
                        {
                          label: "Change role",
                          icon: <EditIcon className="w-4 h-4" />,
                          onClick: () => setRoleTarget(user),
                        },
                      ]
                    : []),
                  {
                    label: user.isActive ? "Ban user" : "Unban user",
                    icon: <ReportIcon className="w-4 h-4" />,
                    onClick: () =>
                      user.isActive
                        ? setBanTarget(user)
                        : handleUnban(user),
                  },
                  {
                    label: "Delete account",
                    icon: <TrashIcon className="w-4 h-4" />,
                    onClick: () => setDeleteTarget(user),
                    variant: "danger" as const,
                  },
                ];

                return (
                  <tr key={user.id} className="hover:bg-gray-50/40 transition-colors">
                    {/* User */}
                    <td className="px-5 py-4">
                      <Link
                        href={`/users/${user.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 shrink-0">
                          {avatarUrl ? (
                            <Image
                              src={avatarUrl}
                              alt={username}
                              width={36}
                              height={36}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                              <UserIcon className="w-4 h-4 text-primary" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 group-hover:text-primary transition-colors truncate">
                            {displayName ?? `@${username}`}
                          </p>
                          {displayName && (
                            <p className="text-xs text-gray-400 truncate">
                              @{username}
                            </p>
                          )}
                        </div>
                      </Link>
                    </td>
                    {/* Email */}
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-gray-600 truncate block max-w-[200px]">
                        {user.email}
                      </span>
                    </td>
                    {/* Role */}
                    <td className="px-4 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    {/* Status */}
                    <td className="px-4 py-4">
                      <StatusBadge
                        isActive={user.isActive}
                        banReason={user.banReason}
                      />
                    </td>
                    {/* Joined */}
                    <td className="px-4 py-4 hidden lg:table-cell text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-4">
                      <DropdownMenu
                        trigger={
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700">
                            <KebabMenuIcon className="w-4 h-4" />
                          </button>
                        }
                        items={menuItems.filter((i) => !("href" in i && i.href && false))}
                        align="right"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ban modal */}
      {banTarget && (
        <BanModal
          isOpen
          onClose={() => setBanTarget(null)}
          username={banTarget.profile?.username ?? banTarget.email}
          onConfirm={handleBan}
        />
      )}

      {/* Change role modal */}
      {roleTarget && (
        <ChangeRoleModal
          isOpen
          onClose={() => setRoleTarget(null)}
          username={roleTarget.profile?.username ?? roleTarget.email}
          currentRole={roleTarget.role}
          targetRole={roleTarget.role}
          onConfirm={handleChangeRole}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmModal
          isOpen
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete account"
          message={`This will permanently delete @${deleteTarget.profile?.username ?? deleteTarget.email}'s account and all their data. This cannot be undone.`}
          confirmLabel="Delete account"
          variant="danger"
        />
      )}
    </>
  );
}
