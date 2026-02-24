import { IsString, IsOptional, MaxLength, IsNumber } from 'class-validator';

export class UpdateWorkoutDayDto {
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
  dayOrder?: number;

  @IsNumber()
  @IsOptional()
  workoutProgramId?: number;
}
