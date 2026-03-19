import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  bookId?: string | null;
}
