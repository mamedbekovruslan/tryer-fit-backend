import { IsString, IsOptional, MaxLength, IsNumber } from 'class-validator';

export class UpdateWorkoutProgramDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsNumber()
  @IsOptional()
  workoutCategoryId?: number;
}
