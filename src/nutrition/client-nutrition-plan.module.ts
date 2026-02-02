import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientNutritionPlan } from './client-nutrition-plan.entity';
import { ClientNutritionPlanService } from './client-nutrition-plan.service';
import { ClientNutritionPlanController } from './client-nutrition-plan.controller';
import { Client } from '../users/client.entity';
import { NutritionPlan } from './nutrition-plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClientNutritionPlan, Client, NutritionPlan])],
  providers: [ClientNutritionPlanService],
  controllers: [ClientNutritionPlanController],
  exports: [ClientNutritionPlanService],
})
export class ClientNutritionPlanModule {}