import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateClientWorkoutProgramDto {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
