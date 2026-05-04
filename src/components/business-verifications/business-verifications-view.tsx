"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { AdminVerificationItem, VerificationStatus } from "@/src/types";
import { businessVerificationsService } from "@/src/services/business-verifications.service";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { LoadingSpinner } from "@/src/components/ui/loading-spinner";
import { formatDate } from "@/src/utils/date";
import SearchIcon from "@/public/icons/search.svg";

const LIMIT = 20;

const statusStyles: Record<VerificationStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  UNDER_REVIEW: "bg-blue-100 text-blue-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const statusLabels: Record<VerificationStatus, string> = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

function VerificationStatusBadge({ status }: { status: VerificationStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="border-b border-gray-100 bg-gray-50/60 px-5 py-3.5 flex gap-8">
        {["w-32", "w-20", "w-16", "w-24", "w-24", "w-16"].map((w, i) => (
          <div key={i} className={`h-3 ${w} bg-gray-200 rounded`} />
        ))}
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
          <div className="w-8 h-3 bg-gray-100 rounded hidden md:block" />
          <div className="w-20 h-5 bg-gray-100 rounded" />
          <div className="w-24 h-3 bg-gray-100 rounded hidden lg:block" />
          <div className="w-16 h-7 bg-gray-100 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function BusinessVerificationsView() {
  const [items, setItems] = useState<AdminVerificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<VerificationStatus | "">("PENDING");

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSearch = useRef("");

  const fetchItems = useCallback(
    async (opts: { reset?: boolean; cursor?: string } = {}) => {
      const { reset = false, cursor } = opts;
      if (reset) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const result = await businessVerificationsService.list({
          cursor,
          limit: LIMIT,
          search: pendingSearch.current || undefined,
          status: status || undefined,
        });

        setItems((prev) => (reset ? result.data : [...prev, ...result.data]));
        setNextCursor(result.nextCursor);
        setHasMore(result.hasMore);
      } catch {
        toast.error("Failed to load verification requests");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [status],
  );

  useEffect(() => {
    pendingSearch.current = search;
    fetchItems({ reset: true });
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      pendingSearch.current = value;
      fetchItems({ reset: true });
    }, 400);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search by business name…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            leftIcon={<SearchIcon className="w-4 h-4" />}
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as VerificationStatus | "")}
          className="sm:w-44"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          No verification requests found.
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
                    Submitted By
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Docs
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    Submitted
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.business.name}
                        </p>
                        {item.business.isVerified && (
                          <p className="text-xs text-green-600 mt-0.5">
                            Already verified
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      @{item.submittedBy.username}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {item.documentCount}
                    </td>
                    <td className="px-4 py-3">
                      <VerificationStatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/business-verifications/${item.id}`}>
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          Showing {items.length} request{items.length !== 1 ? "s" : ""}
          {hasMore ? " — load more below" : ""}
        </p>
      )}

      {/* Load more */}
      {!isLoading && hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => fetchItems({ cursor: nextCursor })}
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
    </div>
  );
}
