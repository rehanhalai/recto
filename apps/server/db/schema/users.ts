import * as crypto from "crypto";
import {
  pgTable,
  pgEnum,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { addedBooks, bookReviews, bookLists } from "./interactions";
import { posts, blogs } from "./content";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["user", "admin", "moderator"]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userName: varchar("user_name", { length: 50 }).unique().notNull(),
    fullName: varchar("full_name", { length: 100 }),
    email: varchar("email", { length: 255 }).unique().notNull(),
    googleId: varchar("google_id", { length: 255 }).unique(),
    hashedPassword: text("hashed_password"),
    bio: varchar("bio", { length: 300 }),
    avatarImage: text("avatar_image"),
    avatarPublicId: text("avatar_public_id"),
    coverImage: text("cover_image"),
    coverPublicId: text("cover_public_id"),
    role: userRoleEnum("role").default("user").notNull(),
    isVerified: boolean("is_verified").default(false).notNull(),
    followerCount: integer("follower_count").default(0).notNull(),
    followingCount: integer("following_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    emailIdx: index("users_email_idx").on(t.email),
    userNameIdx: index("users_user_name_idx").on(t.userName),
  }),
);

export const sessions = pgTable(
  "sessions",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()), // this IS your session_id
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    userAgent: varchar("user_agent", { length: 500 }),
    ipAddress: varchar("ip_address", { length: 50 }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    userIdIdx: index("sessions_user_id_idx").on(t.userId),
  }),
);

export const otps = pgTable(
  "otps",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    email: varchar("email", { length: 255 }).notNull(),
    hashedCode: text("hashed_code").notNull(),
    hashedPassword: text("hashed_password"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    emailIdx: index("otps_email_idx").on(t.email),
  }),
);

export const followers = pgTable(
  "followers",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    followerId: varchar("follower_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    followingId: varchar("following_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    uniqueFollowerIdx: uniqueIndex("unique_follower_idx").on(
      t.followerId,
      t.followingId,
    ),
    noSelfFollowCheck: check(
      "chk_no_self_follow",
      sql`follower_id != following_id`,
    ),
  }),
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  addedBooks: many(addedBooks),
  reviews: many(bookReviews),
  posts: many(posts),
  blogs: many(blogs),
  bookLists: many(bookLists),
  followers: many(followers, { relationName: "followers" }),
  following: many(followers, { relationName: "following" }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const followersRelations = relations(followers, ({ one }) => ({
  follower: one(users, {
    fields: [followers.followerId],
    references: [users.id],
    relationName: "following",
  }),
  following: one(users, {
    fields: [followers.followingId],
    references: [users.id],
    relationName: "followers",
  }),
}));
