"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { AdminComment } from "@/src/types";
import { contentService } from "@/src/services/content.service";
import { ConfirmModal } from "@/src/components/ui/confirm-modal";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { LoadingSpinner } from "@/src/components/ui/loading-spinner";
import { formatDate } from "@/src/utils/date";
import SearchIcon from "@/public/icons/search.svg";
import TrashIcon from "@/public/icons/trash-icon.svg";

const LIMIT = 20;

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="border-b border-gray-100 bg-gray-50/60 px-5 py-3.5 flex gap-8">
        {["w-24", "w-48", "w-24", "w-20", "w-8"].map((w, i) => (
          <div key={i} className={`h-3 ${w} bg-gray-200 rounded`} />
        ))}
      </div>
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-4 border-b border-gray-50"
        >
          <div className="w-24 h-3.5 bg-gray-200 rounded" />
          <div className="flex-1 h-3 bg-gray-100 rounded" />
          <div className="w-28 h-3 bg-gray-100 rounded hidden sm:block" />
          <div className="w-20 h-3 bg-gray-100 rounded hidden lg:block" />
          <div className="w-6 h-6 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}

interface DeleteState {
  commentId: string;
  authorUsername: string;
}

interface CommentsViewProps {
  initialPostId?: string;
}

export function CommentsView({ initialPostId = "" }: CommentsViewProps) {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [postId, setPostId] = useState(initialPostId);
  const [toDelete, setToDelete] = useState<DeleteState | null>(null);

  const postIdRef = useRef(initialPostId);

  const fetchComments = useCallback(
    async (opts: { reset?: boolean; cursor?: string } = {}) => {
      const { reset = false, cursor } = opts;
      if (reset) setIsLoading(true);
      else setIsLoadingMore(true);
      try {
        const result = await contentService.listComments({
          cursor,
          limit: LIMIT,
          postId: postIdRef.current || undefined,
        });
        setComments((prev) =>
          reset ? result.data : [...prev, ...result.data],
        );
        setNextCursor(result.nextCursor);
        setHasMore(result.hasMore);
      } catch {
        toast.error("Failed to load comments");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchComments({ reset: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePostIdChange = (value: string) => {
    setPostId(value);
    if (postIdRef.current === value) return;
    postIdRef.current = value;
    // Debounce: only fetch when user stops typing
    fetchComments({ reset: true });
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    await contentService.deleteComment(toDelete.commentId);
    setComments((prev) => prev.filter((c) => c.id !== toDelete.commentId));
    toast.success("Comment permanently deleted");
  };

  return (
    <div className="space-y-4">
      {/* Filter by Post ID */}
      <div className="max-w-sm">
        <Input
          placeholder="Filter by Post ID…"
          value={postId}
          onChange={(e) => handlePostIdChange(e.target.value)}
          leftIcon={<SearchIcon className="w-4 h-4" />}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : comments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          No comments found.
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
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    Date
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {comments.map((comment) => (
                  <tr
                    key={comment.id}
                    className={`hover:bg-gray-50/50 transition-colors ${comment.isDeleted ? "opacity-50" : ""}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                      @{comment.author.username}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p
                        className={`text-gray-600 truncate ${comment.isDeleted ? "line-through text-gray-400" : ""}`}
                      >
                        {comment.content.slice(0, 120)}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {comment.isDeleted ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                          Deleted
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell whitespace-nowrap">
                      {formatDate(comment.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() =>
                          setToDelete({
                            commentId: comment.id,
                            authorUsername: comment.author.username,
                          })
                        }
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Delete comment permanently"
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
            onClick={() => fetchComments({ cursor: nextCursor })}
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

      {!isLoading && comments.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          Showing {comments.length} comment{comments.length !== 1 ? "s" : ""}
          {hasMore ? " — load more below" : ""}
        </p>
      )}

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Delete comment permanently"
        message={`This will permanently delete @${toDelete?.authorUsername ?? "?"}'s comment. This cannot be undone.`}
        confirmLabel="Delete permanently"
        variant="danger"
      />
    </div>
  );
}
