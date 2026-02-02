import {
  IsString,
  IsOptional,
  MaxLength,
  IsNumber,
  Min,
} from 'class-validator';

export class UpdateMealDto {
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
  @Min(1)
  nutritionDayId?: number;
}