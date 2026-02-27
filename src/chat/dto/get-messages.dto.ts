import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetMessagesDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsOptional()
  limit?: number;

  @IsInt()
  @IsOptional()
  offset?: number;
}
