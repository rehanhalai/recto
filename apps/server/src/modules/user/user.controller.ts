import {
  Controller,
  Patch,
  Body,
  Get,
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
    const users = await this.userService.searchUsers(query.userName);
    if (!users.length) {
      throw new NotFoundException("No users found matching the query.");
    }
    return {
      users,
      message: "Users fetched successfully.",
    };
  }

  @Get("profile")
  async getUserProfile(@Query() query: SearchUserDto) {
    const user = await this.userService.getUserProfile(query.userName);
    return {
      ...user,
      message: "User fetched successfully.",
    };
  }

  @UseGuards(AuthGuard)
  @Get("me/current-read")
  async getCurrentRead(@CurrentUser() user: AuthenticatedRequestUser) {
    const currentRead = await this.userService.getCurrentRead(user.id);
    return {
      data: currentRead,
      message: "Current read fetched successfully",
    };
  }
}
