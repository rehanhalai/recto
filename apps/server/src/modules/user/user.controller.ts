import {
  Controller,
  Delete,
  Patch,
  Body,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  NotFoundException,
} from "@nestjs/common";
import { UserService } from "./user.service";
import {
  UpdateProfileDto,
  UserNameAvailabilityDto,
  SearchUserDto,
  ProfileRelationQueryDto,
} from "./dto/user.dto";
import { AuthGuard, OptionalAuthGuard, CurrentUser } from "../common";
import type { AuthenticatedRequestUser } from "../common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Patch("update-profile")
  async updateProfile(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: UpdateProfileDto,
  ) {
    const response = await this.userService.updateProfile(user.id, dto);
    return {
      ...response,
      message: "Profile updated successfully",
    };
  }

  @UseGuards(AuthGuard)
  @Patch("update-profileimage")
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "avatarImage", maxCount: 1 },
      { name: "coverImage", maxCount: 1 },
    ]),
  )
  async updateProfileImage(
    @CurrentUser() user: AuthenticatedRequestUser,
    @UploadedFiles()
    files: {
      avatarImage?: Express.Multer.File[];
      coverImage?: Express.Multer.File[];
    },
    @Body() body: any,
  ) {
    const avatarFile = files?.avatarImage?.[0];
    const coverFile = files?.coverImage?.[0];

    const removeAvatar = body.avatarImage === "remove";
    const removeCover = body.coverImage === "remove";

    const response = await this.userService.updateAvatarAndBanner(
      user.id,
      avatarFile,
      coverFile,
      removeAvatar,
      removeCover,
    );
    return {
      ...response,
      message: "Avatar and/or Banner updated successfully",
    };
  }

  @Get("check")
  async checkUsernameAvailability(@Query() dto: UserNameAvailabilityDto) {
    const isAvailable = await this.userService.userNameAvailability(
      dto.userName,
    );
    return {
      isAvailable,
      message: isAvailable ? "available" : "taken",
    };
  }

  @Get("generate-username")
  async generateUsername() {
    const username = await this.userService.generateRandomUsername();
    return {
      username,
      message: "Generated username",
    };
  }

  @UseGuards(AuthGuard)
  @Get("whoami")
  async whoami(@CurrentUser() user: AuthenticatedRequestUser) {
    const response = await this.userService.whoAmI(user.id);
    return {
      ...response,
      message: "User fetched successfully",
    };
  }

  @Get("search")
  async searchUsers(@Query() query: SearchUserDto) {
    const data = await this.userService.searchUsers(query.userName);
    if (!data.pagination.hasMore) {
      throw new NotFoundException("No users found matching the query.");
    }
    return {
      data,
      message: "Users fetched successfully.",
    };
  }

  @UseGuards(OptionalAuthGuard)
  @Get("profile")
  async getUserProfile(
    @CurrentUser() user: AuthenticatedRequestUser | null,
    @Query() query: SearchUserDto,
  ) {
    const profile = await this.userService.getUserProfile(
      query.userName,
      user?.id,
    );
    return {
      data: profile,
      message: "User fetched successfully.",
    };
  }

  @Get("profile/followers")
  async getFollowers(@Query() query: ProfileRelationQueryDto) {
    const data = await this.userService.getFollowersByUserName(
      query.userName,
      query.cursor,
      query.limit,
    );

    return {
      data,
      message: "Followers fetched successfully.",
    };
  }

  @Get("profile/following")
  async getFollowing(@Query() query: ProfileRelationQueryDto) {
    const data = await this.userService.getFollowingByUserName(
      query.userName,
      query.cursor,
      query.limit,
    );

    return {
      data,
      message: "Following fetched successfully.",
    };
  }

  @UseGuards(AuthGuard)
  @Post("follow/:targetUserId")
  async followUser(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("targetUserId") targetUserId: string,
  ) {
    const data = await this.userService.followUser(user.id, targetUserId);
    return {
      data,
      message: "User followed successfully.",
    };
  }

  @UseGuards(AuthGuard)
  @Delete("follow/:targetUserId")
  async unfollowUser(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("targetUserId") targetUserId: string,
  ) {
    const data = await this.userService.unfollowUser(user.id, targetUserId);
    return {
      data,
      message: "User unfollowed successfully.",
    };
  }
}
