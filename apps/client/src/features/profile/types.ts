import type { BookList, BookResponse, User } from "@recto/types";
export type { ApiEnvelope } from "@recto/types";

export type ProfileUser = Pick<
  User,
  | "id"
  | "userName"
  | "fullName"
  | "bio"
  | "avatarImage"
  | "coverImage"
  | "role"
  | "createdAt"
> & {
  followerCount: number;
  followingCount: number;
};

export type ProfileContext = {
  isMe: boolean;
  isFollowing: boolean;
};

export type ProfilePayload = {
  user: ProfileUser;
  context: ProfileContext;
};

export type RelationMode = "followers" | "following";

export type RelationUser = Pick<
  User,
  "id" | "userName" | "fullName" | "avatarImage"
>;

export type ProfileRelationPage = {
  data: RelationUser[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type TrackerBook = Pick<BookResponse, "id" | "title" | "coverImage"> & {
  authors: string[];
};

export type TrackerEntry = {
  id: string;
  status: "wishlist" | "reading" | "finished";
  book: TrackerBook;
};

export type PublicList = Pick<BookList, "id" | "name" | "description"> & {
  is_public: boolean;
  book_count: number;
  covers: string[];
};
