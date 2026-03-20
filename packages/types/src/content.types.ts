/**
 * Content-related types inferred from Drizzle ORM schema
 * Includes posts, post interactions, and blogs
 */

import { InferSelectModel } from "drizzle-orm";
import {
  posts,
  postLikes,
  postComments,
  postCommentLikes,
  blogs,
} from "@recto/server/db/schema/content";

// ─── Raw Inferred Types ───────────────────────────────────────────────────────

export type Post = InferSelectModel<typeof posts>;

export type PostLike = InferSelectModel<typeof postLikes>;

export type PostComment = InferSelectModel<typeof postComments>;

export type PostCommentLike = InferSelectModel<typeof postCommentLikes>;

export type Blog = InferSelectModel<typeof blogs>;

// ─── API Response Types ────────────────────────────────────────────────────────

export type PostWithRelations = Post & {
  author?: {
    id: string;
    userName: string;
    fullName: string | null;
    avatarImage: string | null;
  };
  book?: {
    id: string;
    title: string;
    coverImage: string | null;
    sourceId?: string; // External provider ID (e.g., Google Books volume ID)
  } | null;
  isLikedByMe?: boolean;
  likeCount: number;
  commentCount: number;
};

export type PostCommentWithRelations = PostComment & {
  author?: {
    id: string;
    userName: string;
    avatarImage: string | null;
  };
  replies?: PostCommentWithRelations[];
  isLikedByMe?: boolean;
  likeCount: number;
};

export type PostLikesResponse = PostLike & {
  user?: {
    id: string;
    userName: string;
    avatarImage: string | null;
  };
};

export type PostCommentLikeResponse = PostCommentLike & {
  user?: {
    id: string;
    userName: string;
  };
};

export type BlogResponse = Blog & {
  author?: {
    id: string;
    userName: string;
    fullName: string | null;
    avatarImage: string | null;
  };
  excerptText?: string; // First 150 chars of content
  readTime?: number; // Estimated read time in minutes
};

export type BlogDetailResponse = BlogResponse & {
  content: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type BlogWithStats = BlogResponse & {
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
};
