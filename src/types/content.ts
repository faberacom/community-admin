import { PaginatedResponse } from "./api";

export interface AdminPostAuthor {
  id: string;
  username: string;
}

export type PostType = "TEXT" | "MEDIA" | "MIXED";
export type PostVisibility = "PUBLIC" | "FOLLOWERS" | "GROUP" | "BUSINESS";

export interface AdminPost {
  id: string;
  content?: string;
  postType: PostType;
  visibility: PostVisibility;
  isDeleted: boolean;
  isEdited: boolean;
  createdAt: string;
  author: AdminPostAuthor;
  commentCount: number;
  reactionCount: number;
}

export interface AdminComment {
  id: string;
  content: string;
  postId: string;
  parentCommentId?: string;
  isDeleted: boolean;
  createdAt: string;
  author: AdminPostAuthor;
}

export type AdminPostListResponse = PaginatedResponse<AdminPost>;
export type AdminCommentListResponse = PaginatedResponse<AdminComment>;

export interface PostsQuery {
  cursor?: string;
  limit?: number;
  search?: string;
  authorId?: string;
}

export interface CommentsQuery {
  cursor?: string;
  limit?: number;
  postId?: string;
}
