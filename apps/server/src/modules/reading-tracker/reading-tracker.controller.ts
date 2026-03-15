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

@Controller("book")
@UseGuards(AuthGuard)
export class ReadingTrackerController {
  constructor(private readonly readingTrackerService: ReadingTrackerService) {}

  @Post("tbrbook")
  async saveEntry(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: SaveReadingTrackerEntryDto,
  ): Promise<any> {
    const entry = await this.readingTrackerService.saveEntry(user.id, dto);
    return {
      ...entry,
      message: "Reading tracker entry saved successfully",
    };
  }

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

  @Get("fetch-user-books")
  async listEntries(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Query() query: GetReadingTrackerEntriesDto,
  ): Promise<any> {
    const books = await this.readingTrackerService.listEntries(user.id, query);
    return {
      books,
      message: "Reading tracker entries fetched successfully",
    };
  }
}
