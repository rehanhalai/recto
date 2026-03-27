CREATE TYPE "public"."book_source" AS ENUM('google_books', 'open_library', 'manual');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'moderator');--> statement-breakpoint
CREATE TYPE "public"."reading_status" AS ENUM('wishlist', 'reading', 'finished');--> statement-breakpoint
CREATE TABLE "book_authors" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"book_id" varchar(255) NOT NULL,
	"author_name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_genres" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"book_id" varchar(255) NOT NULL,
	"genre_id" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"source_id" varchar(255) NOT NULL,
	"source" "book_source" DEFAULT 'google_books' NOT NULL,
	"title" varchar(255) NOT NULL,
	"subtitle" varchar(255),
	"release_date" varchar(50),
	"description" text,
	"page_count" integer,
	"language" varchar(10),
	"isbn13" varchar(13),
	"average_rating" numeric(3, 2),
	"ratings_count" integer DEFAULT 0 NOT NULL,
	"cover_image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "genres" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "genres_name_unique" UNIQUE("name"),
	CONSTRAINT "genres_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"author_id" varchar(255) NOT NULL,
	"title" varchar(200) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"cover_image" text,
	"content" text NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blogs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "post_comment_likes" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"comment_id" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_comments" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"post_id" varchar(255) NOT NULL,
	"parent_id" varchar(255),
	"content" varchar(300) NOT NULL,
	"likes_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_likes" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"post_id" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"author_id" varchar(255) NOT NULL,
	"book_id" varchar(255),
	"content" varchar(500) NOT NULL,
	"image" text,
	"likes_count" integer DEFAULT 0 NOT NULL,
	"comments_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "followers" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"follower_id" varchar(255) NOT NULL,
	"following_id" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_no_self_follow" CHECK (follower_id != following_id)
);
--> statement-breakpoint
CREATE TABLE "otps" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"hashed_code" text NOT NULL,
	"hashed_password" text,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"is_revoked" boolean DEFAULT false NOT NULL,
	"user_agent" varchar(500),
	"ip_address" varchar(50),
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_name" varchar(50) NOT NULL,
	"full_name" varchar(100),
	"email" varchar(255) NOT NULL,
	"google_id" varchar(255),
	"hashed_password" text,
	"bio" varchar(300),
	"avatar_image" text,
	"avatar_public_id" text,
	"cover_image" text,
	"cover_public_id" text,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"follower_count" integer DEFAULT 0 NOT NULL,
	"following_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_user_name_unique" UNIQUE("user_name"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
CREATE TABLE "added_books" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"book_id" varchar(255) NOT NULL,
	"status" "reading_status" DEFAULT 'wishlist' NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_added_books_finished_at" CHECK ("added_books"."status" != 'finished' OR "added_books"."finished_at" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "book_list_items" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"list_id" varchar(255) NOT NULL,
	"book_id" varchar(255) NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_lists" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(500),
	"is_public" boolean DEFAULT true NOT NULL,
	"book_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_reviews" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"book_id" varchar(255) NOT NULL,
	"content" text,
	"rating" smallint NOT NULL,
	"contains_spoilers" boolean DEFAULT false NOT NULL,
	"likes_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_likes" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"review_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "book_authors" ADD CONSTRAINT "book_authors_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_genres" ADD CONSTRAINT "book_genres_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_genres" ADD CONSTRAINT "book_genres_genre_id_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comment_likes" ADD CONSTRAINT "post_comment_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comment_likes" ADD CONSTRAINT "post_comment_likes_comment_id_post_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."post_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_parent_id_post_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."post_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followers" ADD CONSTRAINT "followers_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followers" ADD CONSTRAINT "followers_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "added_books" ADD CONSTRAINT "added_books_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "added_books" ADD CONSTRAINT "added_books_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_list_items" ADD CONSTRAINT "book_list_items_list_id_book_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."book_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_list_items" ADD CONSTRAINT "book_list_items_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_lists" ADD CONSTRAINT "book_lists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_reviews" ADD CONSTRAINT "book_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_reviews" ADD CONSTRAINT "book_reviews_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_likes" ADD CONSTRAINT "review_likes_review_id_book_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."book_reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_likes" ADD CONSTRAINT "review_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "book_authors_book_id_idx" ON "book_authors" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "book_authors_author_name_idx" ON "book_authors" USING btree ("author_name");--> statement-breakpoint
CREATE UNIQUE INDEX "book_genres_book_genre_idx" ON "book_genres" USING btree ("book_id","genre_id");--> statement-breakpoint
CREATE INDEX "book_genres_genre_id_idx" ON "book_genres" USING btree ("genre_id");--> statement-breakpoint
CREATE INDEX "books_source_id_idx" ON "books" USING btree ("source_id");--> statement-breakpoint
CREATE UNIQUE INDEX "books_source_source_id_idx" ON "books" USING btree ("source","source_id");--> statement-breakpoint
CREATE INDEX "books_title_idx" ON "books" USING btree ("title");--> statement-breakpoint
CREATE INDEX "books_isbn13_idx" ON "books" USING btree ("isbn13");--> statement-breakpoint
CREATE UNIQUE INDEX "genres_slug_idx" ON "genres" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "blogs_slug_idx" ON "blogs" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blogs_author_id_idx" ON "blogs" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "blogs_is_published_idx" ON "blogs" USING btree ("is_published");--> statement-breakpoint
CREATE UNIQUE INDEX "post_comment_likes_user_comment_idx" ON "post_comment_likes" USING btree ("user_id","comment_id");--> statement-breakpoint
CREATE INDEX "post_comment_likes_comment_id_idx" ON "post_comment_likes" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "post_comments_post_id_idx" ON "post_comments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "post_comments_parent_id_idx" ON "post_comments" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "post_likes_user_post_idx" ON "post_likes" USING btree ("user_id","post_id");--> statement-breakpoint
CREATE INDEX "post_likes_post_id_idx" ON "post_likes" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "posts_author_id_idx" ON "posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "posts_book_id_idx" ON "posts" USING btree ("book_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_follower_idx" ON "followers" USING btree ("follower_id","following_id");--> statement-breakpoint
CREATE INDEX "otps_email_idx" ON "otps" USING btree ("email");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_user_name_idx" ON "users" USING btree ("user_name");--> statement-breakpoint
CREATE UNIQUE INDEX "added_books_user_book_idx" ON "added_books" USING btree ("user_id","book_id");--> statement-breakpoint
CREATE INDEX "added_books_status_idx" ON "added_books" USING btree ("user_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "book_list_items_list_book_idx" ON "book_list_items" USING btree ("list_id","book_id");--> statement-breakpoint
CREATE INDEX "book_list_items_list_id_idx" ON "book_list_items" USING btree ("list_id");--> statement-breakpoint
CREATE INDEX "book_lists_user_id_idx" ON "book_lists" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "book_review_user_book_idx" ON "book_reviews" USING btree ("user_id","book_id");--> statement-breakpoint
CREATE INDEX "book_reviews_book_id_idx" ON "book_reviews" USING btree ("book_id");--> statement-breakpoint
CREATE UNIQUE INDEX "review_like_review_user_idx" ON "review_likes" USING btree ("review_id","user_id");