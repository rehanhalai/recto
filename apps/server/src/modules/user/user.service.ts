import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { StorageService } from "../storage/storage.service";
import { UploadAssetType } from "../storage/enums/upload-asset-type.enum";
import { eq, ilike, and, desc, lt } from "drizzle-orm";
import { DRIZZLE } from "../../../db/db.module";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../../../db/schema";
import { followers, users } from "../../../db/schema";
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

  private toAuthUser(user: typeof schema.users.$inferSelect) {
    return {
      id: user.id,
      userName: user.userName,
      fullName: user.fullName,
      email: user.email,
      avatarImage: user.avatarImage,
      coverImage: user.coverImage,
      role: user.role,
    };
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
    return this.toAuthUser(user);
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

    return this.toAuthUser(updatedUser);
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

    return this.toAuthUser(updatedUser);
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

  private async getFollowingState(viewerId: string, targetUserId: string) {
    const existing = await this.db.query.followers.findFirst({
      where: and(
        eq(followers.followerId, viewerId),
        eq(followers.followingId, targetUserId),
      ),
      columns: {
        id: true,
      },
    });

    return Boolean(existing);
  }

  async getUserProfile(userName: string, viewerId?: string) {
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

    const isMe = Boolean(viewerId && viewerId === user.id);
    const isFollowing =
      viewerId && !isMe
        ? await this.getFollowingState(viewerId, user.id)
        : false;

    return {
      user,
      context: {
        isMe,
        isFollowing,
      },
    };
  }

  async getFollowersByUserName(userName: string, cursor?: string, limit = 30) {
    const safeLimit = Math.min(Math.max(limit || 30, 1), 100);

    const target = await this.db.query.users.findFirst({
      where: eq(users.userName, userName.trim().toLowerCase()),
      columns: { id: true },
    });

    if (!target) {
      throw new NotFoundException("No user found matching the query.");
    }

    let cursorDate: Date | undefined;
    if (cursor) {
      const parsed = new Date(cursor);
      if (!Number.isNaN(parsed.getTime())) {
        cursorDate = parsed;
      }
    }

    const query = this.db
      .select({
        id: users.id,
        userName: users.userName,
        fullName: users.fullName,
        avatarImage: users.avatarImage,
        followedAt: followers.createdAt,
      })
      .from(followers)
      .innerJoin(users, eq(followers.followerId, users.id))
      .orderBy(desc(followers.createdAt), desc(followers.id))
      .limit(safeLimit + 1);

    const rows = await (cursorDate
      ? query.where(
          and(
            eq(followers.followingId, target.id),
            lt(followers.createdAt, cursorDate),
          ),
        )
      : query.where(eq(followers.followingId, target.id)));

    const hasMore = rows.length > safeLimit;
    const data = hasMore ? rows.slice(0, safeLimit) : rows;
    const nextCursor = hasMore
      ? (data[data.length - 1]?.followedAt?.toISOString() ?? null)
      : null;

    return {
      data: data.map((row) => ({
        id: row.id,
        userName: row.userName,
        fullName: row.fullName,
        avatarImage: row.avatarImage,
      })),
      nextCursor,
      hasMore,
    };
  }

  async getFollowingByUserName(userName: string, cursor?: string, limit = 30) {
    const safeLimit = Math.min(Math.max(limit || 30, 1), 100);

    const target = await this.db.query.users.findFirst({
      where: eq(users.userName, userName.trim().toLowerCase()),
      columns: { id: true },
    });

    if (!target) {
      throw new NotFoundException("No user found matching the query.");
    }

    let cursorDate: Date | undefined;
    if (cursor) {
      const parsed = new Date(cursor);
      if (!Number.isNaN(parsed.getTime())) {
        cursorDate = parsed;
      }
    }

    const query = this.db
      .select({
        id: users.id,
        userName: users.userName,
        fullName: users.fullName,
        avatarImage: users.avatarImage,
        followedAt: followers.createdAt,
      })
      .from(followers)
      .innerJoin(users, eq(followers.followingId, users.id))
      .orderBy(desc(followers.createdAt), desc(followers.id))
      .limit(safeLimit + 1);

    const rows = await (cursorDate
      ? query.where(
          and(
            eq(followers.followerId, target.id),
            lt(followers.createdAt, cursorDate),
          ),
        )
      : query.where(eq(followers.followerId, target.id)));

    const hasMore = rows.length > safeLimit;
    const data = hasMore ? rows.slice(0, safeLimit) : rows;
    const nextCursor = hasMore
      ? (data[data.length - 1]?.followedAt?.toISOString() ?? null)
      : null;

    return {
      data: data.map((row) => ({
        id: row.id,
        userName: row.userName,
        fullName: row.fullName,
        avatarImage: row.avatarImage,
      })),
      nextCursor,
      hasMore,
    };
  }

  async followUser(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      throw new BadRequestException("You cannot follow yourself.");
    }

    const target = await this.db.query.users.findFirst({
      where: eq(users.id, targetUserId),
      columns: { id: true },
    });

    if (!target) {
      throw new NotFoundException("Target user not found");
    }

    const existing = await this.db.query.followers.findFirst({
      where: and(
        eq(followers.followerId, currentUserId),
        eq(followers.followingId, targetUserId),
      ),
      columns: { id: true },
    });

    if (existing) {
      return { isFollowing: true };
    }

    await this.db.insert(followers).values({
      followerId: currentUserId,
      followingId: targetUserId,
    });

    return { isFollowing: true };
  }

  async unfollowUser(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      throw new BadRequestException("You cannot unfollow yourself.");
    }

    const deleted = await this.db
      .delete(followers)
      .where(
        and(
          eq(followers.followerId, currentUserId),
          eq(followers.followingId, targetUserId),
        ),
      )
      .returning({ id: followers.id });

    if (deleted.length === 0) {
      return { isFollowing: false };
    }

    return { isFollowing: false };
  }
}
