import * as crypto from "crypto";
import {
  pgTable,
  varchar,
  text,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { books } from "./books";

export const blogs = pgTable("blogs", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  authorId: varchar("author_id", { length: 255 })
    .references(() => users.id)
    .notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  coverImage: text("cover_image"),
  content: text("content").notNull(),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const blogComments = pgTable("blog_comments", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 255 })
    .references(() => users.id)
    .notNull(),
  blogId: varchar("blog_id", { length: 255 })
    .references(() => blogs.id)
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const posts = pgTable("posts", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  authorId: varchar("author_id", { length: 255 })
    .references(() => users.id)
    .notNull(),
  bookId: varchar("book_id", { length: 255 }).references(() => books.id),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  status: varchar("status", { length: 50 }).default("published"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const postComments = pgTable(
  "post_comments",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id)
      .notNull(),
    postId: varchar("post_id", { length: 255 })
      .references(() => posts.id)
      .notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    postIdIdx: index("post_comments_post_id_idx").on(t.postId),
  }),
);

export const postLikes = pgTable("post_likes", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 255 })
    .references(() => users.id)
    .notNull(),
  postId: varchar("post_id", { length: 255 })
    .references(() => posts.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const blogsRelations = relations(blogs, ({ one, many }) => ({
  author: one(users, {
    fields: [blogs.authorId],
    references: [users.id],
  }),
  comments: many(blogComments),
}));

export const blogCommentsRelations = relations(blogComments, ({ one }) => ({
  user: one(users, {
    fields: [blogComments.userId],
    references: [users.id],
  }),
  blog: one(blogs, {
    fields: [blogComments.blogId],
    references: [blogs.id],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(postComments),
}));

export const postCommentsRelations = relations(postComments, ({ one }) => ({
  user: one(users, {
    fields: [postComments.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [postComments.postId],
    references: [posts.id],
  }),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  user: one(users, {
    fields: [postLikes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [postLikes.postId],
    references: [posts.id],
  }),
}));
