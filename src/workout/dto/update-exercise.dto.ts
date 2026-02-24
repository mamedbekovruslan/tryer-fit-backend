import { IsString, IsOptional, MaxLength, IsNumber } from 'class-validator';

export class UpdateExerciseDto {
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
  sets?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  reps?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  weight?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  restTime?: string;

  @IsNumber()
  @IsOptional()
  exerciseOrder?: number;

  @IsNumber()
  @IsOptional()
  workoutDayId?: number;
}
