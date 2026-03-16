import { IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class UpdateClientNutritionPlanDto {
  @IsNumber()
  @IsOptional()
  clientId?: number;

  @IsNumber()
  @IsOptional()
  nutritionPlanId?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
