import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateNutritionCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000) // Ограничение для описания
  description?: string;
}
