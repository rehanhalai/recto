import { users } from '../../db/schema';

export const USER_SELECT_FIELDS = {
  id: users.id,
  userName: users.userName,
  fullName: users.fullName,
  email: users.email,
  avatarImage: users.avatarImage,
  coverImage: users.coverImage,
  role: users.role,
  isVerified: users.isVerified,
};
