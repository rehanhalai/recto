import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { StorageService } from "../common/storage.service";
import { eq, ilike } from "drizzle-orm";
import { DRIZZLE } from "../../../db/db.module";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../../../db/schema";
import { users } from "../../../db/schema";
import {
  uniqueNamesGenerator,
  adjectives,
  animals,
} from "unique-names-generator";
import { UpdateProfileDto } from "./dto/user.dto";

@Injectable()
export class UserService {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly storageService: StorageService,
  ) {}

  generateRandomUsername() {
    const randomName = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: "",
      style: "capital",
      length: 2,
    });
    const randomNumber = Math.floor(100 + Math.random() * 900);
    return `${randomName}${randomNumber}`;
  }

  async userNameAvailability(userName: string) {
    const existing = await this.db.query.users.findFirst({
      where: eq(users.userName, userName.trim().toLowerCase()),
    });
    return !existing;
  }

  async whoAmI(userId: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!user) throw new NotFoundException("User not found");
    const { googleId, hashedPassword, ...userData } = user;
    return userData;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!user) throw new NotFoundException("User not found");

    if (dto.userName && dto.userName !== user.userName) {
      if (!(await this.userNameAvailability(dto.userName))) {
        throw new ConflictException("Username already taken");
      }
    }

    const [updatedUser] = await this.db
      .update(users)
      .set({ ...dto })
      .where(eq(users.id, userId))
      .returning();

    const { hashedPassword, ...userData } = updatedUser;
    return userData;
  }

  async updateAvatarAndBanner(
    userId: string,
    avatarFile?: Express.Multer.File,
    coverFile?: Express.Multer.File,
    removeAvatar = false,
    removeCover = false,
  ) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!user) throw new NotFoundException("User not found");

    let newAvatar = user.avatarImage;
    if (removeAvatar && user.avatarImage) {
      await this.storageService.deleteFile(user.avatarImage);

      newAvatar = null;
    } else if (avatarFile) {
      if (user.avatarImage) {
        await this.storageService.deleteFile(user.avatarImage);
      }
      newAvatar = await this.storageService.uploadFile(avatarFile, "avatars");
    }

    let newCover = user.coverImage;
    if (removeCover && user.coverImage) {
      await this.storageService.deleteFile(user.coverImage);

      newCover = null;
    } else if (coverFile) {
      if (user.coverImage) {
        await this.storageService.deleteFile(user.coverImage);
      }
      newCover = await this.storageService.uploadFile(coverFile, "covers");
    }

    const [updatedUser] = await this.db
      .update(users)
      .set({ avatarImage: newAvatar, coverImage: newCover })
      .where(eq(users.id, userId))
      .returning();

    const { hashedPassword, ...userData } = updatedUser;
    return userData;
  }

  async searchUsers(userName: string) {
    const results = await this.db.query.users.findMany({
      where: ilike(users.userName, `%${userName}%`),
      columns: {
        id: true,
        userName: true,
        fullName: true,
        avatarImage: true,
      },
      limit: 20,
    });
    return results;
  }

  async getUserProfile(userName: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.userName, userName.trim().toLowerCase()),
      columns: {
        id: true,
        userName: true,
        fullName: true,
        bio: true,
        avatarImage: true,
        coverImage: true,
        followerCount: true,
        followingCount: true,
        role: true,
        createdAt: true,
      },
      with: {
        posts: {
          limit: 10,
          orderBy: (posts, { desc }) => [desc(posts.createdAt)],
        },
      },
    });
    if (!user) throw new NotFoundException("No user found matching the query.");
    return user;
  }
}
