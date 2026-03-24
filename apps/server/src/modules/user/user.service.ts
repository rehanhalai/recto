import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { StorageService } from "../storage/storage.service";
import { UploadAssetType } from "../storage/enums/upload-asset-type.enum";
import { eq, ilike, and, desc } from "drizzle-orm";
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
    let newAvatarPublicId = user.avatarPublicId ?? null;

    if (removeAvatar) {
      if (user.avatarPublicId) {
        await this.storageService.delete(user.avatarPublicId);
      }
      newAvatar = null;
      newAvatarPublicId = null;
    } else if (avatarFile) {
      // Delete the old avatar before uploading the replacement
      if (user.avatarPublicId) {
        await this.storageService.delete(user.avatarPublicId);
      }
      const result = await this.storageService.upload(
        avatarFile,
        UploadAssetType.USER_AVATAR,
        userId,
      );
      newAvatar = result.url;
      newAvatarPublicId = result.publicId;
    }

    let newCover = user.coverImage;
    let newCoverPublicId = user.coverPublicId ?? null;

    if (removeCover) {
      if (user.coverPublicId) {
        await this.storageService.delete(user.coverPublicId);
      }
      newCover = null;
      newCoverPublicId = null;
    } else if (coverFile) {
      // Delete the old cover before uploading the replacement
      if (user.coverPublicId) {
        await this.storageService.delete(user.coverPublicId);
      }
      const result = await this.storageService.upload(
        coverFile,
        UploadAssetType.USER_COVER,
        userId,
      );
      newCover = result.url;
      newCoverPublicId = result.publicId;
    }

    const [updatedUser] = await this.db
      .update(users)
      .set({
        avatarImage: newAvatar,
        avatarPublicId: newAvatarPublicId,
        coverImage: newCover,
        coverPublicId: newCoverPublicId,
      })
      .where(eq(users.id, userId))
      .returning();

    const { hashedPassword, ...userData } = updatedUser;
    return userData;
  }

  async searchUsers(userName: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    const results = await this.db.query.users.findMany({
      where: ilike(users.userName, `%${userName}%`),
      columns: {
        id: true,
        userName: true,
        fullName: true,
        avatarImage: true,
      },
      limit: limit + 1, // Fetch one extra to check if there's more
      offset,
    });

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    return {
      users: data,
      pagination: {
        currentPage: page,
        limit,
        hasMore,
      },
    };
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
          orderBy: (posts) => [desc(posts.createdAt)],
        },
      },
    });
    if (!user) throw new NotFoundException("No user found matching the query.");
    return user;
  }
}
