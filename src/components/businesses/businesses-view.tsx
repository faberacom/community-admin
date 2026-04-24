"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { AdminBusiness } from "@/src/types";
import { businessesService } from "@/src/services/businesses.service";
import { ConfirmModal } from "@/src/components/ui/confirm-modal";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { LoadingSpinner } from "@/src/components/ui/loading-spinner";
import { formatDate } from "@/src/utils/date";
import TrashIcon from "@/public/icons/trash-icon.svg";
import SearchIcon from "@/public/icons/search.svg";
import CheckRoundedIcon from "@/public/icons/check-rounded-icon.svg";
import StarIcon from "@/public/icons/star-icon.svg";

const LIMIT = 20;

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="border-b border-gray-100 bg-gray-50/60 px-5 py-3.5 flex gap-8">
        {["w-32", "w-20", "w-24", "w-16", "w-10", "w-10", "w-20"].map(
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
            <div className="h-3.5 w-36 bg-gray-200 rounded" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
          </div>
          <div className="w-20 h-3 bg-gray-100 rounded hidden sm:block" />
          <div className="w-24 h-3 bg-gray-100 rounded hidden md:block" />
          <div className="flex gap-1.5">
            <div className="w-5 h-5 bg-gray-100 rounded-full" />
            <div className="w-5 h-5 bg-gray-100 rounded-full" />
          </div>
          <div className="w-20 h-3 bg-gray-100 rounded hidden lg:block" />
          <div className="flex gap-2">
            <div className="w-20 h-7 bg-gray-100 rounded-lg" />
            <div className="w-20 h-7 bg-gray-100 rounded-lg" />
            <div className="w-7 h-7 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BusinessesView() {
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState("");
  const [isVerified, setIsVerified] = useState<boolean | "">("");
  const [toDelete, setToDelete] = useState<AdminBusiness | null>(null);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSearch = useRef("");

  const fetchBusinesses = useCallback(
    async (opts: { reset?: boolean; cursor?: string } = {}) => {
      const { reset = false, cursor } = opts;
      if (reset) setIsLoading(true);
      else setIsLoadingMore(true);
      try {
        const result = await businessesService.list({
          cursor,
          limit: LIMIT,
          search: pendingSearch.current || undefined,
          isVerified: isVerified !== "" ? isVerified : undefined,
        });
        setBusinesses((prev) =>
          reset ? result.data : [...prev, ...result.data],
        );
        setNextCursor(result.nextCursor);
        setHasMore(result.hasMore);
      } catch {
        toast.error("Failed to load businesses");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [isVerified],
  );

  useEffect(() => {
    pendingSearch.current = search;
    fetchBusinesses({ reset: true });
  }, [isVerified]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      pendingSearch.current = value;
      fetchBusinesses({ reset: true });
    }, 400);
  };

  const updateBusiness = (id: string, patch: Partial<AdminBusiness>) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    );
  };

  const handleToggleVerify = async (business: AdminBusiness) => {
    try {
      const updated = await businessesService.setVerified(
        business.id,
        !business.isVerified,
      );
      updateBusiness(business.id, {
        isVerified: updated.isVerified,
        isFeatured: updated.isFeatured,
      });
      toast.success(
        updated.isVerified
          ? `"${business.name}" verified`
          : `"${business.name}" unverified`,
      );
    } catch {
      toast.error("Failed to update verification");
    }
  };

  const handleToggleFeature = async (business: AdminBusiness) => {
    try {
      const updated = await businessesService.setFeatured(
        business.id,
        !business.isFeatured,
      );
      updateBusiness(business.id, {
        isVerified: updated.isVerified,
        isFeatured: updated.isFeatured,
      });
      toast.success(
        updated.isFeatured
          ? `"${business.name}" featured`
          : `"${business.name}" unfeatured`,
      );
    } catch {
      toast.error("Failed to update feature status");
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    await businessesService.delete(toDelete.id);
    setBusinesses((prev) => prev.filter((b) => b.id !== toDelete.id));
    toast.success(`"${toDelete.name}" deleted`);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search businesses…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            leftIcon={<SearchIcon className="w-4 h-4" />}
          />
        </div>
        <Select
          value={String(isVerified)}
          onChange={(e) => {
            const v = e.target.value;
            setIsVerified(v === "" ? "" : v === "true");
          }}
          className="sm:w-40"
        >
          <option value="">All businesses</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : businesses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          No businesses found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Location
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Badges
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    Created
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {businesses.map((business) => (
                  <tr
                    key={business.id}
                    className={`hover:bg-gray-50/50 transition-colors ${business.isDeleted ? "opacity-50" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <Link
                          href={`/businesses/${business.id}`}
                          className="font-medium text-gray-900 hover:text-primary transition-colors"
                        >
                          {business.name}
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5">
                          by @{business.owner.username}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      {business.category}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {[business.city, business.country]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {business.isVerified && (
                          <span
                            title="Verified"
                            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600"
                          >
                            <CheckRoundedIcon className="w-3 h-3" />
                          </span>
                        )}
                        {business.isFeatured && (
                          <span
                            title="Featured"
                            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-600"
                          >
                            <StarIcon className="w-3 h-3" />
                          </span>
                        )}
                        {!business.isVerified && !business.isFeatured && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">
                      {formatDate(business.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {!business.isDeleted && (
                          <>
                            <Button
                              variant={
                                business.isVerified ? "outline" : "primary"
                              }
                              size="sm"
                              onClick={() => handleToggleVerify(business)}
                            >
                              {business.isVerified ? "Unverify" : "Verify"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleFeature(business)}
                            >
                              {business.isFeatured ? "Unfeature" : "Feature"}
                            </Button>
                          </>
                        )}
                        <button
                          onClick={() => setToDelete(business)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Delete business"
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
            onClick={() => fetchBusinesses({ cursor: nextCursor })}
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

      {!isLoading && businesses.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          Showing {businesses.length} business
          {businesses.length !== 1 ? "es" : ""}
          {hasMore ? " — load more below" : ""}
        </p>
      )}

      <ConfirmModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Delete business"
        message={`This will permanently delete "${toDelete?.name ?? "this business"}". This cannot be undone.`}
        confirmLabel="Delete business"
        variant="danger"
      />
    </div>
  );
}
