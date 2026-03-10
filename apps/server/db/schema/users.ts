import * as crypto from "crypto";
import {
  pgTable,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { addedBooks, bookReviews, bookLists } from "./interactions";
import { posts, blogs } from "./content";

export const users = pgTable("users", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userName: varchar("user_name", { length: 255 }).unique().notNull(),
  fullName: varchar("full_name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique().notNull(),
  googleId: varchar("google_id", { length: 255 }),
  hashedPassword: text("hashed_password"),
  refreshToken: text("refresh_token"),
  bio: text("bio"),
  avatarImage: text("avatar_image"),
  coverImage: text("cover_image"),
  role: varchar("role", { length: 50 }).default("user"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const otps = pgTable("otps", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: varchar("email", { length: 255 }).notNull(),
  hashedCode: text("hashed_code").notNull(),
  hashedPassword: text("hashed_password"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const followers = pgTable(
  "followers",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    followerId: varchar("follower_id", { length: 255 })
      .references(() => users.id)
      .notNull(),
    followingId: varchar("following_id", { length: 255 })
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    uniqueFollowerIdx: uniqueIndex("unique_follower_idx").on(
      t.followerId,
      t.followingId,
    ),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  addedBooks: many(addedBooks),
  reviews: many(bookReviews),
  posts: many(posts),
  followers: many(followers, { relationName: "followers" }),
  following: many(followers, { relationName: "following" }),
  blogs: many(blogs),
  bookLists: many(bookLists),
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
