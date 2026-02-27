import { IsBoolean, IsOptional } from 'class-validator';

export class MarkAsReadDto {
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;
}
