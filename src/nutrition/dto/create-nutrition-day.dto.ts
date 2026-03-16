import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsNumber,
} from 'class-validator';

export class CreateNutritionDayDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000) // Ограничение для описания
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  nutritionPlanId: number;
}
