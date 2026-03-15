import { Module } from "@nestjs/common";
import { ReadingTrackerController } from "./reading-tracker.controller";
import { ReadingTrackerService } from "./reading-tracker.service";

@Module({
  controllers: [ReadingTrackerController],
  providers: [ReadingTrackerService],
  exports: [ReadingTrackerService],
})
export class ReadingTrackerModule {}
