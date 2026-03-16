import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateNutritionCategoryDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000) // Ограничение для описания
  description?: string;
}
