import { IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateClientNutritionPlanDto {
  @IsNumber()
  clientId: number;

  @IsNumber()
  nutritionPlanId: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}