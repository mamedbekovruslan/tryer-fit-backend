import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

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
