import { apiClient } from "@/src/lib/api-client";
import {
  AdminPost,
  AdminPostListResponse,
  AdminCommentListResponse,
  PostsQuery,
  CommentsQuery,
} from "@/src/types";

export const contentService = {
  async listPosts(params: PostsQuery = {}): Promise<AdminPostListResponse> {
    const query = new URLSearchParams();
    if (params.cursor) query.set("cursor", params.cursor);
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);
    if (params.authorId) query.set("authorId", params.authorId);

    const response = await apiClient.get<AdminPostListResponse>(
      `/admin/content/posts?${query}`,
    );
    return response.data;
  },

  async deletePost(id: string): Promise<void> {
    await apiClient.delete(`/admin/content/posts/${id}`);
  },

  async listComments(
    params: CommentsQuery = {},
  ): Promise<AdminCommentListResponse> {
    const query = new URLSearchParams();
    if (params.cursor) query.set("cursor", params.cursor);
    if (params.limit) query.set("limit", String(params.limit));
    if (params.postId) query.set("postId", params.postId);

    const response = await apiClient.get<AdminCommentListResponse>(
      `/admin/content/comments?${query}`,
    );
    return response.data;
  },

  async deleteComment(id: string): Promise<void> {
    await apiClient.delete(`/admin/content/comments/${id}`);
  },

  async getPost(id: string): Promise<AdminPost> {
    const response = await apiClient.get<AdminPost>(
      `/admin/content/posts/${id}`,
    );
    return response.data;
  },
};
