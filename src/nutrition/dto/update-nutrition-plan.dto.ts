import { IsString, IsOptional, MaxLength, IsNumber } from 'class-validator';

export class UpdateNutritionPlanDto {
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
  nutritionCategoryId?: number;
}
