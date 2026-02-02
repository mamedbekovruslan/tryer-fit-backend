import { IsNumber, IsBoolean } from 'class-validator';

export class CreateClientNutritionPlanDto {
  @IsNumber()
  clientId: number;

  @IsNumber()
  nutritionPlanId: number;

  @IsBoolean()
  isActive: boolean;
}