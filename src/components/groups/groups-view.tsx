"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { AdminGroup } from "@/src/types";
import { groupsService } from "@/src/services/groups.service";
import { analyticsService } from "@/src/services/analytics.service";
import { ConfirmModal } from "@/src/components/ui/confirm-modal";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { LoadingSpinner } from "@/src/components/ui/loading-spinner";
import { formatDate } from "@/src/utils/date";
import { ApprovalBadge } from "./approval-badge";
import SearchIcon from "@/public/icons/search.svg";
import TrashIcon from "@/public/icons/trash-icon.svg";

const LIMIT = 20;

type TabId = "ALL" | "PENDING" | "APPROVED" | "DELETED";

const TABS: { id: TabId; label: string }[] = [
  { id: "ALL", label: "All" },
  // { id: "PENDING", label: "Pending Approval" },
  // { id: "APPROVED", label: "Approved" },
  { id: "DELETED", label: "Deleted" },
];

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="border-b border-gray-100 bg-gray-50/60 px-5 py-3.5 flex gap-8">
        {["w-32", "w-20", "w-20", "w-14", "w-16", "w-14", "w-20"].map(
          (w, i) => (
            <div key={i} className={`h-3 ${w} bg-gray-200 rounded`} />
          ),
        )}
      </div>
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-4 border-b border-gray-50"
        >
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-40 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
          <div className="w-16 h-5 bg-gray-100 rounded-full hidden sm:block" />
          <div className="w-16 h-3 bg-gray-100 rounded hidden md:block" />
          <div className="w-10 h-3 bg-gray-100 rounded hidden md:block" />
          <div className="w-16 h-5 bg-gray-100 rounded-full" />
          <div className="w-20 h-3 bg-gray-100 rounded hidden lg:block" />
          <div className="flex gap-2">
            <div className="w-16 h-7 bg-gray-100 rounded-lg" />
            <div className="w-16 h-7 bg-gray-100 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

function getTabParams(tab: TabId): { isApproved?: boolean } {
  if (tab === "PENDING") return { isApproved: false };
  if (tab === "APPROVED") return { isApproved: true };
  return {};
}

export function GroupsView() {
  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("ALL");
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<AdminGroup | null>(null);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSearch = useRef("");
  const activeTabRef = useRef<TabId>("ALL");

  const fetchGroups = useCallback(
    async (opts: { reset?: boolean; cursor?: string } = {}) => {
      const { reset = false, cursor } = opts;
      if (reset) setIsLoading(true);
      else setIsLoadingMore(true);
      try {
        const tabParams = getTabParams(activeTabRef.current);
        const result = await groupsService.list({
          cursor,
          limit: LIMIT,
          search: pendingSearch.current || undefined,
          ...tabParams,
        });

        let data = result.data;
        if (activeTabRef.current === "DELETED") {
          data = data.filter((g) => g.isDeleted);
        }

        setGroups((prev) => (reset ? data : [...prev, ...data]));
        setNextCursor(result.nextCursor);
        setHasMore(result.hasMore);
      } catch {
        toast.error("Failed to load groups");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    pendingSearch.current = search;
    activeTabRef.current = activeTab;
    fetchGroups({ reset: true });
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    analyticsService
      .getOverview()
      .then((stats) => setPendingCount(stats.groups.pendingApproval))
      .catch(() => {});
  }, []);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      pendingSearch.current = value;
      fetchGroups({ reset: true });
    }, 400);
  };

  const handleApprove = async (group: AdminGroup) => {
    try {
      await groupsService.approve(group.id);
      setGroups((prev) =>
        prev.map((g) => (g.id === group.id ? { ...g, isApproved: true } : g)),
      );
      toast.success(`"${group.name}" approved`);
      if (pendingCount !== null) setPendingCount((c) => (c ?? 1) - 1);
    } catch {
      toast.error("Failed to approve group");
    }
  };

  const handleReject = async (group: AdminGroup) => {
    try {
      await groupsService.reject(group.id);
      setGroups((prev) =>
        prev.map((g) => (g.id === group.id ? { ...g, isApproved: false } : g)),
      );
      toast.success(`"${group.name}" rejected`);
    } catch {
      toast.error("Failed to reject group");
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    await groupsService.delete(toDelete.id);
    setGroups((prev) => prev.filter((g) => g.id !== toDelete.id));
    toast.success(`"${toDelete.name}" deleted`);
  };

  const displayedGroups =
    activeTab === "ALL" ? groups.filter((g) => !g.isDeleted) : groups;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 sm:px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? "text-primary border-primary"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                {tab.label}
                {tab.id === "PENDING" &&
                  pendingCount !== null &&
                  pendingCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                      {pendingCount > 99 ? "99+" : pendingCount}
                    </span>
                  )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <Input
          placeholder="Search groups…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          leftIcon={<SearchIcon className="w-4 h-4" />}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : displayedGroups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          No groups found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Group
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                    Visibility
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Members
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Posts
                  </th>
                  {/* <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th> */}
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    Created
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayedGroups.map((group) => (
                  <tr
                    key={group.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <Link
                          href={`/groups/${group.id}`}
                          className="font-medium text-gray-900 hover:text-primary transition-colors"
                        >
                          {group.name}
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5">
                          by @{group.creator.username}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      {group.category}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-gray-500">
                        {group.visibility === "PUBLIC" ? "Public" : "Private"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 hidden md:table-cell">
                      {group.memberCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 hidden md:table-cell">
                      {group.postCount.toLocaleString()}
                    </td>
                    {/* <td className="px-4 py-3">
                      <ApprovalBadge
                        isApproved={group.isApproved}
                        isDeleted={group.isDeleted}
                      />
                    </td> */}
                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">
                      {formatDate(group.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {!group.isApproved && !group.isDeleted && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApprove(group)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(group)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {group.isApproved && !group.isDeleted && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(group)}
                          >
                            Revoke
                          </Button>
                        )}
                        <button
                          onClick={() => setToDelete(group)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Delete group"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Load more */}
      {!isLoading && hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => fetchGroups({ cursor: nextCursor })}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Loading…
              </span>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      )}

      {!isLoading && displayedGroups.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          Showing {displayedGroups.length} group
          {displayedGroups.length !== 1 ? "s" : ""}
          {hasMore ? " — load more below" : ""}
        </p>
      )}

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Delete group"
        message={`This will permanently delete "${toDelete?.name ?? "this group"}". This cannot be undone.`}
        confirmLabel="Delete group"
        variant="danger"
      />
    </div>
  );
}
