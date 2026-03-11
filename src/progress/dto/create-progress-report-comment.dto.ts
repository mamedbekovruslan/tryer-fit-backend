import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateProgressReportCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  comment: string;
}
