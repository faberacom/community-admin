"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { moderationService } from "@/src/services/moderation.service";
import { analyticsService } from "@/src/services/analytics.service";
import { Report, ReportStatus, TargetType, ReportReason } from "@/src/types";
import { Select } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { ReportsTable, ReportsTableSkeleton } from "./reports-table";

const STATUS_TABS: { id: ReportStatus | "ALL"; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "OPEN", label: "Open" },
  { id: "UNDER_REVIEW", label: "Under Review" },
  { id: "RESOLVED", label: "Resolved" },
  { id: "DISMISSED", label: "Dismissed" },
];

const TARGET_TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "POST", label: "Post" },
  { value: "COMMENT", label: "Comment" },
  { value: "USER", label: "User" },
  { value: "BUSINESS", label: "Business" },
  { value: "GROUP", label: "Group" },
  { value: "EVENT", label: "Event" },
];

const REASON_OPTIONS = [
  { value: "", label: "All reasons" },
  { value: "SPAM", label: "Spam" },
  { value: "HARASSMENT", label: "Harassment" },
  { value: "HATE", label: "Hate Speech" },
  { value: "MISINFORMATION", label: "Misinformation" },
  { value: "OTHER", label: "Other" },
];

const LIMIT = 20;

export function ReportsView() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [openCount, setOpenCount] = useState<number | null>(null);

  const [activeStatus, setActiveStatus] = useState<ReportStatus | "ALL">(
    "ALL",
  );
  const [targetType, setTargetType] = useState<TargetType | "">("");
  const [reason, setReason] = useState<ReportReason | "">("");

  const fetchReports = useCallback(
    async (opts: { append?: boolean; cursorVal?: string } = {}) => {
      try {
        const data = await moderationService.list({
          limit: LIMIT,
          status: activeStatus !== "ALL" ? activeStatus : "",
          targetType: targetType || "",
          reason: reason || "",
          cursor: opts.cursorVal,
        });
        setReports((prev) =>
          opts.append ? [...prev, ...data.data] : data.data,
        );
        setCursor(data.nextCursor ?? undefined);
        setHasMore(data.hasMore);
      } catch {
        toast.error("Failed to load reports");
      }
    },
    [activeStatus, targetType, reason],
  );

  useEffect(() => {
    setIsLoading(true);
    setReports([]);
    setCursor(undefined);
    fetchReports().finally(() => setIsLoading(false));
  }, [fetchReports]);

  useEffect(() => {
    analyticsService
      .getOverview()
      .then((stats) => setOpenCount(stats.reports.open))
      .catch(() => {});
  }, []);

  const handleLoadMore = async () => {
    if (!cursor) return;
    setIsLoadingMore(true);
    await fetchReports({ append: true, cursorVal: cursor });
    setIsLoadingMore(false);
  };

  const handleTabChange = (status: ReportStatus | "ALL") => {
    setActiveStatus(status);
  };

  return (
    <div className="space-y-4">
      {/* Status tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex overflow-x-auto">
          {STATUS_TABS.map((tab) => {
            const isActive = activeStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-4 sm:px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? "text-primary border-primary"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                {tab.label}
                {tab.id === "OPEN" && openCount !== null && openCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full text-[10px] font-bold bg-red-500 text-white">
                    {openCount > 99 ? "99+" : openCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="w-44">
          <Select
            value={targetType}
            onChange={(e) => setTargetType(e.target.value as TargetType | "")}
          >
            {TARGET_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-44">
          <Select
            value={reason}
            onChange={(e) => setReason(e.target.value as ReportReason | "")}
          >
            {REASON_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <ReportsTableSkeleton />
      ) : (
        <ReportsTable reports={reports} />
      )}

      {/* Load more */}
      {!isLoading && hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}

      {!isLoading && (
        <p className="text-center text-xs text-gray-400">
          {reports.length} report{reports.length !== 1 ? "s" : ""} loaded
        </p>
      )}
    </div>
  );
}
