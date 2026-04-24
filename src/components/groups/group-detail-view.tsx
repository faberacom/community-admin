"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AdminGroupDetail } from "@/src/types";
import { groupsService } from "@/src/services/groups.service";
import { Button } from "@/src/components/ui/button";
import { ConfirmModal } from "@/src/components/ui/confirm-modal";
import { getMediaUrl } from "@/src/utils/functions";
import { formatDate } from "@/src/utils/date";
import { ApprovalBadge } from "./approval-badge";
import GroupsIcon from "@/public/icons/groups.svg";
import PeopleIcon from "@/public/icons/people-icon.svg";
import FeedIcon from "@/public/icons/feed.svg";

interface StatBoxProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

function StatBox({ icon, label, value }: StatBoxProps) {
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

interface SettingRowProps {
  label: string;
  enabled: boolean;
}

function SettingRow({ label, enabled }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          enabled
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {enabled ? "On" : "Off"}
      </span>
    </div>
  );
}

interface GroupDetailViewProps {
  groupId: string;
}

export function GroupDetailView({ groupId }: GroupDetailViewProps) {
  const [group, setGroup] = useState<AdminGroupDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const router = useRouter();

  useEffect(() => {
    groupsService
      .getById(groupId)
      .then(setGroup)
      .catch(() => toast.error("Failed to load group"))
      .finally(() => setIsLoading(false));
  }, [groupId]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="bg-white rounded-2xl border border-gray-100 h-40" />
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-xl h-16" />
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 h-32" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-20 text-gray-400">Group not found.</div>
    );
  }

  const logoUrl = group.logoUrl ? getMediaUrl(group.logoUrl) : null;
  const coverUrl = group.coverImageUrl ? getMediaUrl(group.coverImageUrl) : null;

  const handleApprove = async () => {
    const updated = await groupsService.approve(group.id);
    setGroup((prev) => prev && { ...prev, isApproved: updated.isApproved });
    toast.success(`"${group.name}" approved`);
  };

  const handleReject = async () => {
    const updated = await groupsService.reject(group.id);
    setGroup((prev) => prev && { ...prev, isApproved: updated.isApproved });
    toast.success(`"${group.name}" rejected`);
  };

  const handleDelete = async () => {
    await groupsService.delete(group.id);
    toast.success(`"${group.name}" deleted`);
    router.push("/groups");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Cover + Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Cover image */}
        <div className="h-28 bg-gray-100 relative">
          {coverUrl && (
            <Image
              src={coverUrl}
              alt="Cover"
              fill
              className="object-cover"
            />
          )}
        </div>
        <div className="p-6 pt-4">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 -mt-8 border-2 border-white shadow-sm">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={group.name}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <GroupsIcon className="w-6 h-6 text-primary" />
                </div>
              )}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {group.name}
                  </h2>
                  <p className="text-sm text-gray-400">
                    by @{group.creator.username}
                  </p>
                </div>
                <ApprovalBadge
                  isApproved={group.isApproved}
                  isDeleted={group.isDeleted}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                <span>{group.category}</span>
                <span>·</span>
                <span>
                  {group.visibility === "PUBLIC" ? "Public" : "Private"}
                </span>
                <span>·</span>
                <span>Created {formatDate(group.createdAt)}</span>
              </div>
              {group.description && (
                <p className="mt-2 text-sm text-gray-600">{group.description}</p>
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
        <div className="grid grid-cols-3 gap-3">
          <StatBox
            icon={<PeopleIcon className="w-4 h-4 text-primary" />}
            label="Members"
            value={group.memberCount}
          />
          <StatBox
            icon={<FeedIcon className="w-4 h-4 text-blue-500" />}
            label="Posts"
            value={group.postCount}
          />
          <StatBox
            icon={<FeedIcon className="w-4 h-4 text-amber-500" />}
            label="Events"
            value={group.eventCount}
          />
        </div>
      </div>

      {/* Settings */}
      {group.settings && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Settings
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <SettingRow
              label="Allow member invites"
              enabled={group.settings.allowMemberInvites}
            />
            <SettingRow
              label="Require post approval"
              enabled={group.settings.requirePostApproval}
            />
            <SettingRow
              label="Allow member posts"
              enabled={group.settings.allowMemberPosts}
            />
            <SettingRow
              label="Auto-approve members"
              enabled={group.settings.autoApproveMembers}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      {!group.isDeleted && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Actions
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-wrap gap-3">
            {!group.isApproved ? (
              <Button variant="primary" size="sm" onClick={handleApprove}>
                Approve group
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={handleReject}>
                Revoke approval
              </Button>
            )}
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDelete(true)}
            >
              Delete group
            </Button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete group"
        message={`This will permanently delete "${group.name}" and all its content. This cannot be undone.`}
        confirmLabel="Delete group"
        variant="danger"
      />
    </div>
  );
}
