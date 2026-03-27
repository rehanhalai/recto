-- triggers and constraints

-- ─── Rating constraint on book_reviews ───────────────────────────────────────
ALTER TABLE book_reviews
  ADD CONSTRAINT chk_rating_range CHECK (rating >= 1 AND rating <= 5);

-- ─── books.average_rating + ratings_count ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_book_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE books
  SET
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM book_reviews
      WHERE book_id = COALESCE(NEW.book_id, OLD.book_id)
    ),
    ratings_count = (
      SELECT COUNT(*)
      FROM book_reviews
      WHERE book_id = COALESCE(NEW.book_id, OLD.book_id)
    )
  WHERE id = COALESCE(NEW.book_id, OLD.book_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_book_rating
AFTER INSERT OR UPDATE OR DELETE ON book_reviews
FOR EACH ROW EXECUTE FUNCTION update_book_rating();

-- ─── book_lists.book_count ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_book_list_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE book_lists
  SET book_count = (
    SELECT COUNT(*) FROM book_list_items
    WHERE list_id = COALESCE(NEW.list_id, OLD.list_id)
  )
  WHERE id = COALESCE(NEW.list_id, OLD.list_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_book_list_count
AFTER INSERT OR DELETE ON book_list_items
FOR EACH ROW EXECUTE FUNCTION update_book_list_count();

-- ─── users.follower_count + following_count ───────────────────────────────────
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
    UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users SET follower_count = follower_count - 1 WHERE id = OLD.following_id;
    UPDATE users SET following_count = following_count - 1 WHERE id = OLD.follower_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_follow_counts
AFTER INSERT OR DELETE ON followers
FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- ─── book_reviews.likes_count ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_review_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE book_reviews
  SET likes_count = (
    SELECT COUNT(*) FROM review_likes
    WHERE review_id = COALESCE(NEW.review_id, OLD.review_id)
  )
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_review_likes_count
AFTER INSERT OR DELETE ON review_likes
FOR EACH ROW EXECUTE FUNCTION update_review_likes_count();

-- ─── posts.likes_count ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts
  SET likes_count = (
    SELECT COUNT(*) FROM post_likes
    WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
  )
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_post_likes_count
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- ─── posts.comments_count ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts
  SET comments_count = (
    SELECT COUNT(*) FROM post_comments
    WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
  )
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_post_comments_count
AFTER INSERT OR DELETE ON post_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- ─── post_comments.likes_count ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_post_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE post_comments
  SET likes_count = (
    SELECT COUNT(*) FROM post_comment_likes
    WHERE comment_id = COALESCE(NEW.comment_id, OLD.comment_id)
  )
  WHERE id = COALESCE(NEW.comment_id, OLD.comment_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_post_comment_likes_count
AFTER INSERT OR DELETE ON post_comment_likes
FOR EACH ROW EXECUTE FUNCTION update_post_comment_likes_count();