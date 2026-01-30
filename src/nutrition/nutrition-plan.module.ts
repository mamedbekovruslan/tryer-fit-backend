import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutritionPlan } from './nutrition-plan.entity';
import { NutritionPlanService } from './nutrition-plan.service';
import { NutritionPlanController } from './nutrition-plan.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NutritionPlan])],
  providers: [NutritionPlanService],
  controllers: [NutritionPlanController],
  exports: [NutritionPlanService],
})
export class NutritionPlanModule {}