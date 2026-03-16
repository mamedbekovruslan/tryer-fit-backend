import { IsString, IsOptional, MaxLength, IsNumber } from 'class-validator';

export class UpdateNutritionDayDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000) // Ограничение для описания
  description?: string;

  @IsNumber()
  @IsOptional()
  nutritionPlanId?: number;
}
