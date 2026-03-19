/**
 * User-related types inferred from Drizzle ORM schema
 */

import { InferSelectModel } from "drizzle-orm";
import { users, sessions, followers } from "@recto/server/db/schema/users";

// ─── Raw Inferred Types ───────────────────────────────────────────────────────

export type User = InferSelectModel<typeof users>;

export type Session = InferSelectModel<typeof sessions>;

export type Follower = InferSelectModel<typeof followers>;

// ─── API Response Types ────────────────────────────────────────────────────────

export type UserWithRelations = User & {
  followerCount: number;
  followingCount: number;
  isVerified: boolean;
};

export type SessionWithRelations = Session & {
  user?: User;
};

export type FollowerWithRelations = Follower & {
  follower?: User;
  following?: User;
};

export type UserProfile = User & {
  followers: FollowerWithRelations[];
  following: FollowerWithRelations[];
  postsCount: number;
  blogsCount: number;
  reviewsCount: number;
};
