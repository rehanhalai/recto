import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard, CurrentUser } from "../common";
import type { AuthenticatedRequestUser } from "../common";
import {
  GetReadingTrackerEntriesDto,
  SaveReadingTrackerEntryDto,
} from "./dto/reading-tracker.dto";
import { ReadingTrackerService } from "./reading-tracker.service";

@Controller("tracker")
export class ReadingTrackerController {
  constructor(private readonly readingTrackerService: ReadingTrackerService) {}

  @UseGuards(AuthGuard)
  @Get()
  async listEntries(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Query() query: GetReadingTrackerEntriesDto,
  ): Promise<any> {
    const data = await this.readingTrackerService.listEntries(user.id, query);
    return {
      data,
      message: "Reading tracker entries fetched successfully",
    };
  }

  @Get("user/:userId")
  async listEntriesForUser(
    @Param("userId") userId: string,
    @Query() query: GetReadingTrackerEntriesDto,
  ): Promise<any> {
    const data = await this.readingTrackerService.listEntries(userId, query);
    return {
      data,
      message: "Reading tracker entries fetched successfully",
    };
  }

  @UseGuards(AuthGuard)
  @Post("tbrbook")
  async saveEntry(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: SaveReadingTrackerEntryDto,
  ): Promise<any> {
    const data = await this.readingTrackerService.saveEntry(user.id, dto);
    return {
      ...data,
      message: "Reading tracker entry saved successfully",
    };
  }

  @UseGuards(AuthGuard)
  @Delete("tbrbook/:tbrId")
  async removeEntry(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("tbrId") tbrId: string,
  ): Promise<any> {
    await this.readingTrackerService.removeEntry(user.id, tbrId);
    return {
      message: "Reading tracker entry removed successfully",
    };
  }
}
