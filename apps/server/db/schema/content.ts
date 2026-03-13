import * as crypto from "crypto";
import {
  pgTable,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { books } from "./books";

export const posts = pgTable(
  "posts",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    authorId: varchar("author_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    bookId: varchar("book_id", { length: 255 }).references(() => books.id, {
      onDelete: "set null",
    }),
    content: varchar("content", { length: 500 }).notNull(),
    image: text("image"),
    likesCount: integer("likes_count").default(0).notNull(),
    commentsCount: integer("comments_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    authorIdIdx: index("posts_author_id_idx").on(t.authorId),
    bookIdIdx: index("posts_book_id_idx").on(t.bookId),
  }),
);

export const postLikes = pgTable(
  "post_likes",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    postId: varchar("post_id", { length: 255 })
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    uniquePostLikeIdx: uniqueIndex("post_likes_user_post_idx").on(
      t.userId,
      t.postId,
    ),
    postIdIdx: index("post_likes_post_id_idx").on(t.postId),
  }),
);

export const postComments = pgTable(
  "post_comments",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    postId: varchar("post_id", { length: 255 })
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    parentId: varchar("parent_id", { length: 255 }).references(
      (): any => postComments.id,
      { onDelete: "cascade" },
    ),
    content: varchar("content", { length: 300 }).notNull(),
    likesCount: integer("likes_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    postIdIdx: index("post_comments_post_id_idx").on(t.postId),
    parentIdIdx: index("post_comments_parent_id_idx").on(t.parentId),
  }),
);

export const postCommentLikes = pgTable(
  "post_comment_likes",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    commentId: varchar("comment_id", { length: 255 })
      .references(() => postComments.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    uniqueCommentLikeIdx: uniqueIndex("post_comment_likes_user_comment_idx").on(
      t.userId,
      t.commentId,
    ),
    commentIdIdx: index("post_comment_likes_comment_id_idx").on(t.commentId),
  }),
);

export const blogs = pgTable(
  "blogs",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    authorId: varchar("author_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 255 }).unique().notNull(),
    coverImage: text("cover_image"),
    content: text("content").notNull(),
    isPublished: boolean("is_published").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    slugIdx: uniqueIndex("blogs_slug_idx").on(t.slug),
    authorIdIdx: index("blogs_author_id_idx").on(t.authorId),
    isPublishedIdx: index("blogs_is_published_idx").on(t.isPublished),
  }),
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
  book: one(books, { fields: [posts.bookId], references: [books.id] }),
  likes: many(postLikes),
  comments: many(postComments),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  user: one(users, { fields: [postLikes.userId], references: [users.id] }),
  post: one(posts, { fields: [postLikes.postId], references: [posts.id] }),
}));

export const postCommentsRelations = relations(
  postComments,
  ({ one, many }) => ({
    user: one(users, { fields: [postComments.userId], references: [users.id] }),
    post: one(posts, { fields: [postComments.postId], references: [posts.id] }),
    parent: one(postComments, {
      fields: [postComments.parentId],
      references: [postComments.id],
      relationName: "comment_replies",
    }),
    replies: many(postComments, { relationName: "comment_replies" }),
    likes: many(postCommentLikes),
  }),
);

export const postCommentLikesRelations = relations(
  postCommentLikes,
  ({ one }) => ({
    user: one(users, {
      fields: [postCommentLikes.userId],
      references: [users.id],
    }),
    comment: one(postComments, {
      fields: [postCommentLikes.commentId],
      references: [postComments.id],
    }),
  }),
);

export const blogsRelations = relations(blogs, ({ one }) => ({
  author: one(users, { fields: [blogs.authorId], references: [users.id] }),
}));
