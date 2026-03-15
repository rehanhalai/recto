import { users } from "../../db/schema";

export const SESSION_EXPIRE_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const USER_SELECT_FIELDS = {
  id: users.id,
  userName: users.userName,
  fullName: users.fullName,
  email: users.email,
  avatarImage: users.avatarImage,
  coverImage: users.coverImage,
};
