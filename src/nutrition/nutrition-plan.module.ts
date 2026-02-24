import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutritionPlan } from './nutrition-plan.entity';
import { NutritionPlanService } from './nutrition-plan.service';
import { NutritionPlanController } from './nutrition-plan.controller';
import { Trainer } from '../users/trainer.entity';
import { NutritionCategory } from './nutrition-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NutritionPlan, Trainer, NutritionCategory])],
  providers: [NutritionPlanService],
  controllers: [NutritionPlanController],
  exports: [NutritionPlanService],
})
export class NutritionPlanModule {}