"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ManagedUser, AdminRole } from "@/src/types";
import { usersService } from "@/src/services/users.service";
import { UsersTable } from "./users-table";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { LoadingSpinner } from "@/src/components/ui/loading-spinner";
import SearchIcon from "@/public/icons/search.svg";

const LIMIT = 20;

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="border-b border-gray-100 bg-gray-50/60 px-5 py-3.5 flex gap-8">
        {["w-24", "w-36", "w-16", "w-16", "w-20"].map((w, i) => (
          <div key={i} className={`h-3 ${w} bg-gray-200 rounded`} />
        ))}
      </div>
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-4 border-b border-gray-50"
        >
          <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
          </div>
          <div className="h-3 w-40 bg-gray-100 rounded hidden md:block" />
          <div className="h-5 w-14 bg-gray-100 rounded-full" />
          <div className="h-5 w-14 bg-gray-100 rounded-full" />
          <div className="h-3 w-20 bg-gray-100 rounded hidden lg:block" />
        </div>
      ))}
    </div>
  );
}

export function UsersView() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState<AdminRole | "">("");
  const [isActive, setIsActive] = useState<boolean | "">("");

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSearch = useRef("");

  const fetchUsers = useCallback(
    async (opts: { reset?: boolean; cursor?: string } = {}) => {
      const { reset = false, cursor } = opts;
      if (reset) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const result = await usersService.list({
          cursor,
          limit: LIMIT,
          search: pendingSearch.current || undefined,
          role: role || undefined,
          isActive: isActive !== "" ? isActive : undefined,
        });

        setUsers((prev) => (reset ? result.data : [...prev, ...result.data]));
        setNextCursor(result.nextCursor);
        setHasMore(result.hasMore);
      } catch {
        toast.error("Failed to load users");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [role, isActive],
  );

  // Initial + filter changes
  useEffect(() => {
    pendingSearch.current = search;
    fetchUsers({ reset: true });
  }, [role, isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      pendingSearch.current = value;
      fetchUsers({ reset: true });
    }, 400);
  };

  const handleLoadMore = () => {
    fetchUsers({ cursor: nextCursor });
  };

  const handleUpdate = (updated: ManagedUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  const handleDelete = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            leftIcon={<SearchIcon className="w-4 h-4" />}
          />
        </div>
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value as AdminRole | "")}
          className="sm:w-36"
        >
          <option value="">All roles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </Select>
        <Select
          value={String(isActive)}
          onChange={(e) => {
            const v = e.target.value;
            setIsActive(v === "" ? "" : v === "true");
          }}
          className="sm:w-36"
        >
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Banned</option>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <UsersTable
          users={users}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}

      {/* Load more */}
      {hasMore && !isLoading && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={handleLoadMore}
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
      {!isLoading && users.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          Showing {users.length} user{users.length !== 1 ? "s" : ""}
          {hasMore ? " — scroll down to load more" : ""}
        </p>
      )}
    </div>
  );
}
