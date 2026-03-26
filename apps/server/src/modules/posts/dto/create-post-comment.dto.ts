import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreatePostCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  parentId?: string;
}
