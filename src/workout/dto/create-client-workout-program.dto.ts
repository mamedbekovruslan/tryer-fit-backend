import { IsNumber, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateClientWorkoutProgramDto {
  @IsNumber()
  @IsNotEmpty()
  clientId: number;

  @IsNumber()
  @IsNotEmpty()
  workoutProgramId: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
