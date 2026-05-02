"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { AdminEventItem, EventCategory, EventVisibility } from "@/src/types";
import { eventsService } from "@/src/services/events.service";
import { ConfirmModal } from "@/src/components/ui/confirm-modal";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { LoadingSpinner } from "@/src/components/ui/loading-spinner";
import { formatDate } from "@/src/utils/date";
import SearchIcon from "@/public/icons/search.svg";
import TrashIcon from "@/public/icons/trash-icon.svg";

const LIMIT = 20;

const EVENT_CATEGORIES: EventCategory[] = [
  "MEETUP", "WORKSHOP", "WEBINAR", "CONFERENCE", "PROMOTION",
  "ANNOUNCEMENT", "SOCIAL", "FUNDRAISER", "SPORTS", "CONCERT", "OTHER",
];

const categoryLabel = (c: string) =>
  c.charAt(0) + c.slice(1).toLowerCase();

type DeletedFilter = "all" | "active" | "deleted";

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="border-b border-gray-100 bg-gray-50/60 px-5 py-3.5 flex gap-8">
        {["w-40", "w-24", "w-20", "w-20", "w-16", "w-20", "w-14", "w-16"].map(
          (w, i) => <div key={i} className={`h-3 ${w} bg-gray-200 rounded`} />,
        )}
      </div>
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-48 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
          <div className="w-20 h-3 bg-gray-100 rounded hidden sm:block" />
          <div className="w-16 h-5 bg-gray-100 rounded-full hidden md:block" />
          <div className="w-16 h-3 bg-gray-100 rounded hidden md:block" />
          <div className="w-10 h-3 bg-gray-100 rounded hidden lg:block" />
          <div className="flex gap-2">
            <div className="w-14 h-7 bg-gray-100 rounded-lg" />
            <div className="w-7 h-7 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EventsView() {
  const [events, setEvents] = useState<AdminEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<EventCategory | "">("");
  const [visibility, setVisibility] = useState<EventVisibility | "">("");
  const [deletedFilter, setDeletedFilter] = useState<DeletedFilter>("all");
  const [toDelete, setToDelete] = useState<AdminEventItem | null>(null);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filtersRef = useRef({ search: "", category: "" as EventCategory | "", visibility: "" as EventVisibility | "", deletedFilter: "all" as DeletedFilter });

  const fetchEvents = useCallback(
    async (opts: { reset?: boolean; cursor?: string } = {}) => {
      const { reset = false, cursor } = opts;
      if (reset) setIsLoading(true);
      else setIsLoadingMore(true);
      try {
        const f = filtersRef.current;
        const isDeletedParam =
          f.deletedFilter === "active" ? false :
          f.deletedFilter === "deleted" ? true : undefined;

        const result = await eventsService.list({
          cursor,
          limit: LIMIT,
          search: f.search || undefined,
          category: f.category || undefined,
          visibility: f.visibility || undefined,
          isDeleted: isDeletedParam,
        });
        setEvents((prev) => reset ? result.data : [...prev, ...result.data]);
        setNextCursor(result.nextCursor);
        setHasMore(result.hasMore);
      } catch {
        toast.error("Failed to load events");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchEvents({ reset: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const applyFilters = (patch: Partial<typeof filtersRef.current>) => {
    filtersRef.current = { ...filtersRef.current, ...patch };
    fetchEvents({ reset: true });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => applyFilters({ search: value }), 400);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    await eventsService.delete(toDelete.id);
    setEvents((prev) => prev.filter((e) => e.id !== toDelete.id));
    toast.success(`"${toDelete.title}" deleted`);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 max-w-sm">
          <Input
            placeholder="Search events…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            leftIcon={<SearchIcon className="w-4 h-4" />}
          />
        </div>
        <Select
          value={category}
          onChange={(e) => {
            const v = e.target.value as EventCategory | "";
            setCategory(v);
            applyFilters({ category: v });
          }}
          className="w-40"
        >
          <option value="">All categories</option>
          {EVENT_CATEGORIES.map((c) => (
            <option key={c} value={c}>{categoryLabel(c)}</option>
          ))}
        </Select>
        <Select
          value={visibility}
          onChange={(e) => {
            const v = e.target.value as EventVisibility | "";
            setVisibility(v);
            applyFilters({ visibility: v });
          }}
          className="w-36"
        >
          <option value="">All visibility</option>
          <option value="PUBLIC">Public</option>
          <option value="FOLLOWERS">Followers</option>
          <option value="GROUP">Group</option>
          <option value="BUSINESS">Business</option>
        </Select>
        <Select
          value={deletedFilter}
          onChange={(e) => {
            const v = e.target.value as DeletedFilter;
            setDeletedFilter(v);
            applyFilters({ deletedFilter: v });
          }}
          className="w-36"
        >
          <option value="all">All events</option>
          <option value="active">Active only</option>
          <option value="deleted">Deleted only</option>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          No events found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Creator</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Start Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">RSVPs</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {events.map((event) => (
                  <tr
                    key={event.id}
                    className={`hover:bg-gray-50/50 transition-colors ${event.isDeleted ? "opacity-50" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/events/${event.id}`}
                          className={`font-medium text-gray-900 hover:text-primary transition-colors ${event.isDeleted ? "line-through text-gray-400" : ""}`}
                        >
                          {event.title}
                        </Link>
                        {event.isDeleted && (
                          <span className="text-[10px] font-semibold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                            Deleted
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      @{event.creator.username}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {event.category ? (
                        <span className="text-xs text-gray-500">
                          {categoryLabel(event.category)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${event.isOnline ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                        {event.isOnline ? "Online" : "In-person"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">
                      {formatDate(event.startTime)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 hidden lg:table-cell">
                      {event.rsvpCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/events/${event.id}`}
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => setToDelete(event)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Delete event permanently"
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
            onClick={() => fetchEvents({ cursor: nextCursor })}
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

      {!isLoading && events.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          Showing {events.length} event{events.length !== 1 ? "s" : ""}
          {hasMore ? " — load more below" : ""}
        </p>
      )}

      <ConfirmModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Delete event permanently"
        message={`This will permanently delete "${toDelete?.title ?? "this event"}". This cannot be undone.`}
        confirmLabel="Delete permanently"
        variant="danger"
      />
    </div>
  );
}
