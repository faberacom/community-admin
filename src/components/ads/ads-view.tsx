"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  AdResponse,
  AdPlacement,
  AdSource,
  AdStatus,
  AdsQuery,
  AD_PLACEMENT_LABELS,
  AD_STATUS_LABELS,
} from "@/src/types";
import { adsService } from "@/src/services/ads.service";
import { Button } from "@/src/components/ui/button";
import { ConfirmModal } from "@/src/components/ui/confirm-modal";
import { Switch } from "@/src/components/ui/switch";
import { LoadingSpinner } from "@/src/components/ui/loading-spinner";
import { AdReviewModal } from "@/src/components/ads/ad-review-modal";
import { AdStatsModal } from "@/src/components/ads/ad-stats-modal";
import { formatDate } from "@/src/utils/date";
import { getMediaUrl } from "@/src/utils/functions";
import ImageIcon from "@/public/icons/image-icon.svg";
import { Select } from "../ui/select";

const STATUS_STYLES: Record<AdStatus, string> = {
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-700",
  PENDING_REVIEW: "bg-blue-100 text-blue-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

function AdStatusBadge({ status }: { status: AdStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {AD_STATUS_LABELS[status]}
    </span>
  );
}

const LIMIT = 20;

export function AdsView() {
  const [items, setItems] = useState<AdResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);

  const [source, setSource] = useState<AdSource | "">("");
  const [status, setStatus] = useState<AdStatus | "">("");
  const [placement, setPlacement] = useState<AdPlacement | "">("");

  const [reviewingAd, setReviewingAd] = useState<AdResponse | null>(null);
  const [statsAdId, setStatsAdId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const buildQuery = useCallback(
    (cursor?: string): AdsQuery => ({
      limit: LIMIT,
      source: source || undefined,
      status: status || undefined,
      placement: placement || undefined,
      cursor,
    }),
    [source, status, placement],
  );

  const fetchItems = useCallback(
    async (reset = false) => {
      if (reset) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const cursor = reset ? undefined : nextCursor;
        const res = await adsService.list(buildQuery(cursor));
        setItems((prev) => (reset ? res.data : [...prev, ...res.data]));
        setNextCursor(res.nextCursor);
        setHasMore(res.hasMore);
      } catch {
        toast.error("Failed to load ads");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [buildQuery, nextCursor],
  );

  useEffect(() => {
    fetchItems(true);
  }, [source, status, placement]);

  const handleToggle = async (id: string) => {
    if (togglingId) return;
    setTogglingId(id);
    try {
      const updated = await adsService.toggle(id);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch {
      toast.error("Failed to toggle ad");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await adsService.delete(deletingId);
      setItems((prev) => prev.filter((item) => item.id !== deletingId));
      toast.success("Ad deleted");
    } catch {
      toast.error("Failed to delete ad");
    } finally {
      setDeletingId(null);
    }
  };

  const handleReviewed = () => {
    fetchItems(true);
  };

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={source}
          onChange={(e) => setSource(e.target.value as AdSource | "")}
          // onChange={(e) => setStatus(e.target.value as VerificationStatus | "")}
          className="sm:w-44"
        >
          <option value="">All Sources</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">User</option>
        </Select>

        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as AdStatus | "")}
          className="sm:w-44"
        >
          <option value="">All Statuses</option>
          <option value="PENDING_REVIEW">Pending Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="PENDING_PAYMENT">Pending Payment</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>

        <Select
          value={placement}
          onChange={(e) => setPlacement(e.target.value as AdPlacement | "")}
          className="sm:w-44"
        >
          <option value="">All Placements</option>
          {(Object.entries(AD_PLACEMENT_LABELS) as [AdPlacement, string][]).map(
            ([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ),
          )}
        </Select>

        <div className="ml-auto">
          <Link href="/ads/new">
            <Button variant="primary" size="sm">
              + Create Ad
            </Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            No ads found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400 font-medium uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Ad</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">
                    Placement
                  </th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">
                    Dates
                  </th>
                  <th className="px-4 py-3 text-center hidden md:table-cell">
                    Active
                  </th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((ad) => (
                  <tr
                    key={ad.id}
                    className={`hover:bg-gray-50/50 transition-colors ${
                      ad.status === "PENDING_REVIEW" ? "bg-blue-50/40" : ""
                    }`}
                  >
                    {/* Thumbnail + title */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {ad.imageUrl ? (
                          <img
                            src={getMediaUrl(ad.imageUrl)}
                            alt={ad.title ?? "Ad"}
                            className="w-10 h-10 object-cover rounded-lg shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <span className="font-medium text-gray-800 truncate max-w-[140px]">
                          {ad.title ?? "—"}
                        </span>
                      </div>
                    </td>

                    {/* Placement */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">
                        {AD_PLACEMENT_LABELS[ad.placement]}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          ad.source === "USER"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {ad.source}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <AdStatusBadge status={ad.status} />
                    </td>

                    {/* Dates */}
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell whitespace-nowrap">
                      {ad.startsAt && ad.endsAt
                        ? `${formatDate(ad.startsAt)} – ${formatDate(ad.endsAt)}`
                        : ad.startsAt
                          ? `From ${formatDate(ad.startsAt)}`
                          : "—"}
                    </td>

                    {/* Active toggle */}
                    <td className="px-4 py-3 hidden md:table-cell text-center">
                      <Switch
                        checked={ad.isActive}
                        onChange={() => handleToggle(ad.id)}
                        disabled={togglingId === ad.id}
                        aria-label="Toggle active"
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {ad.status === "PENDING_REVIEW" &&
                        ad.source === "USER" ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setReviewingAd(ad)}
                          >
                            Review
                          </Button>
                        ) : (
                          <>
                            <Link href={`/ads/${ad.id}/edit`}>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setStatsAdId(ad.id)}
                            >
                              Stats
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => setDeletingId(ad.id)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Load more */}
        {hasMore && !isLoading && (
          <div className="px-4 py-4 border-t border-gray-100 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchItems(false)}
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

        {/* Count */}
        {!isLoading && items.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-50 text-xs text-gray-400 text-right">
            {items.length} ad{items.length !== 1 ? "s" : ""}
            {hasMore ? "+" : ""}
          </div>
        )}
      </div>

      {/* Review modal */}
      <AdReviewModal
        ad={reviewingAd}
        isOpen={reviewingAd !== null}
        onClose={() => setReviewingAd(null)}
        onReviewed={handleReviewed}
      />

      {/* Stats modal */}
      <AdStatsModal adId={statsAdId} onClose={() => setStatsAdId(null)} />

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete ad"
        message="This will permanently delete the ad. This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
