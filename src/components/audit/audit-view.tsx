"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { AuditLog } from "@/src/types";
import { auditService } from "@/src/services/audit.service";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { LoadingSpinner } from "@/src/components/ui/loading-spinner";
import { formatDateTime } from "@/src/utils/date";

const LIMIT = 30;

const RESOURCE_TYPES = [
  "USER",
  "POST",
  "COMMENT",
  "GROUP",
  "BUSINESS",
  "AD",
  "REPORT",
  "SYSTEM",
];

// Color-code action badges by category
function getActionColor(action: string): string {
  if (action.startsWith("BAN") || action.startsWith("DELETE"))
    return "bg-red-100 text-red-700";
  if (action.startsWith("UNBAN") || action.startsWith("APPROVE") || action.startsWith("VERIFY") || action.startsWith("FEATURE") || action.startsWith("ENABLE"))
    return "bg-green-100 text-green-700";
  if (action.startsWith("REJECT") || action.startsWith("UNVERIFY") || action.startsWith("UNFEATURE") || action.startsWith("DISABLE"))
    return "bg-amber-100 text-amber-700";
  if (action.startsWith("CREATE") || action.startsWith("UPDATE") || action.startsWith("CHANGE"))
    return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-600";
}

function MetadataCell({ metadata }: { metadata?: Record<string, unknown> }) {
  const [open, setOpen] = useState(false);
  if (!metadata || Object.keys(metadata).length === 0) {
    return <span className="text-gray-300 text-xs">—</span>;
  }
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-primary hover:underline font-medium"
      >
        {open ? "Hide" : "View"}
      </button>
      {open && (
        <pre className="mt-1.5 text-xs bg-gray-50 border border-gray-100 rounded-lg p-2 max-w-xs overflow-x-auto whitespace-pre-wrap break-all text-gray-700">
          {JSON.stringify(metadata, null, 2)}
        </pre>
      )}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="border-b border-gray-100 bg-gray-50/60 px-5 py-3.5 flex gap-8">
        {["w-24", "w-28", "w-20", "w-28", "w-16", "w-28"].map((w, i) => (
          <div key={i} className={`h-3 ${w} bg-gray-200 rounded`} />
        ))}
      </div>
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50"
        >
          <div className="w-24 h-3.5 bg-gray-200 rounded" />
          <div className="w-32 h-5 bg-gray-100 rounded" />
          <div className="w-16 h-3 bg-gray-100 rounded hidden sm:block" />
          <div className="w-28 h-3 bg-gray-100 rounded hidden md:block" />
          <div className="w-10 h-3 bg-gray-100 rounded hidden lg:block" />
          <div className="w-32 h-3 bg-gray-100 rounded hidden lg:block" />
        </div>
      ))}
    </div>
  );
}

export function AuditView() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);

  const [action, setAction] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const actionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filtersRef = useRef({ action: "", resourceType: "", fromDate: "", toDate: "" });

  const fetchLogs = useCallback(
    async (opts: { reset?: boolean; cursor?: string } = {}) => {
      const { reset = false, cursor } = opts;
      if (reset) setIsLoading(true);
      else setIsLoadingMore(true);
      try {
        const f = filtersRef.current;
        const result = await auditService.list({
          cursor,
          limit: LIMIT,
          action: f.action || undefined,
          resourceType: f.resourceType || undefined,
          from: f.fromDate ? new Date(f.fromDate).toISOString() : undefined,
          to: f.toDate
            ? new Date(f.toDate + "T23:59:59").toISOString()
            : undefined,
        });
        setLogs((prev) => (reset ? result.data : [...prev, ...result.data]));
        setNextCursor(result.nextCursor);
        setHasMore(result.hasMore);
      } catch {
        toast.error("Failed to load audit logs");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchLogs({ reset: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const applyFilters = (patch: Partial<typeof filtersRef.current>) => {
    filtersRef.current = { ...filtersRef.current, ...patch };
    fetchLogs({ reset: true });
  };

  const handleActionChange = (value: string) => {
    setAction(value);
    if (actionTimeout.current) clearTimeout(actionTimeout.current);
    actionTimeout.current = setTimeout(() => {
      applyFilters({ action: value });
    }, 400);
  };

  const handleResourceTypeChange = (value: string) => {
    setResourceType(value);
    applyFilters({ resourceType: value });
  };

  const handleFromChange = (value: string) => {
    setFromDate(value);
    applyFilters({ fromDate: value });
  };

  const handleToChange = (value: string) => {
    setToDate(value);
    applyFilters({ toDate: value });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="w-48">
          <Input
            placeholder="Filter by action…"
            value={action}
            onChange={(e) => handleActionChange(e.target.value)}
          />
        </div>
        <div className="w-44">
          <Select
            value={resourceType}
            onChange={(e) => handleResourceTypeChange(e.target.value)}
          >
            <option value="">All resource types</option>
            {RESOURCE_TYPES.map((rt) => (
              <option key={rt} value={rt}>
                {rt}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-40">
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => handleFromChange(e.target.value)}
            placeholder="From date"
          />
        </div>
        <div className="w-40">
          <Input
            type="date"
            value={toDate}
            onChange={(e) => handleToChange(e.target.value)}
            placeholder="To date"
          />
        </div>
        {(action || resourceType || fromDate || toDate) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAction("");
              setResourceType("");
              setFromDate("");
              setToDate("");
              filtersRef.current = {
                action: "",
                resourceType: "",
                fromDate: "",
                toDate: "",
              };
              fetchLogs({ reset: true });
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          No audit logs found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                    Resource
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Resource ID
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    Metadata
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50/50 transition-colors align-top"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                      @{log.adminUsername}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold ${getActionColor(log.action)}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {log.resourceType}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span
                        className="text-xs text-gray-400 font-mono"
                        title={log.resourceId}
                      >
                        {log.resourceId.length > 12
                          ? `${log.resourceId.slice(0, 8)}…`
                          : log.resourceId}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <MetadataCell metadata={log.metadata} />
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap hidden lg:table-cell">
                      {formatDateTime(log.createdAt)}
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
            onClick={() => fetchLogs({ cursor: nextCursor })}
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

      {!isLoading && logs.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          {logs.length} log{logs.length !== 1 ? "s" : ""} loaded
          {hasMore ? " — load more below" : ""}
        </p>
      )}
    </div>
  );
}
