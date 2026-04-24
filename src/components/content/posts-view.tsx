"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { AdminPost } from "@/src/types";
import { contentService } from "@/src/services/content.service";
import { ConfirmModal } from "@/src/components/ui/confirm-modal";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { LoadingSpinner } from "@/src/components/ui/loading-spinner";
import { formatDate } from "@/src/utils/date";
import SearchIcon from "@/public/icons/search.svg";
import TrashIcon from "@/public/icons/trash-icon.svg";

const LIMIT = 20;

const visibilityLabels: Record<string, string> = {
  PUBLIC: "Public",
  FOLLOWERS: "Followers",
  GROUP: "Group",
  BUSINESS: "Business",
};

const typeLabels: Record<string, string> = {
  TEXT: "Text",
  MEDIA: "Media",
  MIXED: "Mixed",
};

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="border-b border-gray-100 bg-gray-50/60 px-5 py-3.5 flex gap-8">
        {["w-24", "w-48", "w-16", "w-16", "w-16", "w-12", "w-20"].map(
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
          <div className="w-24 h-3.5 bg-gray-200 rounded" />
          <div className="flex-1 h-3 bg-gray-100 rounded" />
          <div className="w-14 h-5 bg-gray-100 rounded-full" />
          <div className="w-14 h-5 bg-gray-100 rounded-full hidden sm:block" />
          <div className="w-10 h-3 bg-gray-100 rounded hidden md:block" />
          <div className="w-10 h-3 bg-gray-100 rounded hidden md:block" />
          <div className="w-20 h-3 bg-gray-100 rounded hidden lg:block" />
          <div className="w-6 h-6 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}

interface DeleteState {
  postId: string;
  authorUsername: string;
}

export function PostsView() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<DeleteState | null>(null);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSearch = useRef("");

  const fetchPosts = useCallback(
    async (opts: { reset?: boolean; cursor?: string } = {}) => {
      const { reset = false, cursor } = opts;
      if (reset) setIsLoading(true);
      else setIsLoadingMore(true);
      try {
        const result = await contentService.listPosts({
          cursor,
          limit: LIMIT,
          search: pendingSearch.current || undefined,
        });
        setPosts((prev) => (reset ? result.data : [...prev, ...result.data]));
        setNextCursor(result.nextCursor);
        setHasMore(result.hasMore);
      } catch {
        toast.error("Failed to load posts");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    pendingSearch.current = search;
    fetchPosts({ reset: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      pendingSearch.current = value;
      fetchPosts({ reset: true });
    }, 400);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    await contentService.deletePost(toDelete.postId);
    setPosts((prev) => prev.filter((p) => p.id !== toDelete.postId));
    toast.success("Post permanently deleted");
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="max-w-sm">
        <Input
          placeholder="Search posts…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          leftIcon={<SearchIcon className="w-4 h-4" />}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          No posts found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                    Visibility
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Comments
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Reactions
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    Date
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className={`hover:bg-gray-50/50 transition-colors ${post.isDeleted ? "opacity-50" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="font-medium text-gray-800">
                          @{post.author.username}
                        </span>
                        {post.isDeleted && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-600 line-through decoration-red-400">
                            Deleted
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p
                        className={`text-gray-600 truncate ${post.isDeleted ? "line-through text-gray-400" : ""}`}
                      >
                        {post.content
                          ? post.content.slice(0, 100)
                          : <span className="text-gray-400 italic">No text content</span>}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-gray-500">
                        {typeLabels[post.postType] ?? post.postType}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-gray-500">
                        {visibilityLabels[post.visibility] ?? post.visibility}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 hidden md:table-cell">
                      {post.commentCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 hidden md:table-cell">
                      {post.reactionCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() =>
                          setToDelete({
                            postId: post.id,
                            authorUsername: post.author.username,
                          })
                        }
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Delete post permanently"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
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
            onClick={() => fetchPosts({ cursor: nextCursor })}
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

      {!isLoading && posts.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          Showing {posts.length} post{posts.length !== 1 ? "s" : ""}
          {hasMore ? " — load more below" : ""}
        </p>
      )}

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Delete post permanently"
        message={`This will permanently delete @${toDelete?.authorUsername ?? "?"}'s post and all its comments. This cannot be undone.`}
        confirmLabel="Delete permanently"
        variant="danger"
      />
    </div>
  );
}
