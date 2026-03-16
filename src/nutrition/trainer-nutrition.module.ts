import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainerNutritionController } from './trainer-nutrition.controller';
import { TrainerNutritionService } from './trainer-nutrition.service';
import { NutritionCategory } from './nutrition-category.entity';
import { NutritionPlan } from './nutrition-plan.entity';
import { NutritionDay } from './nutrition-day.entity';
import { Trainer } from '../users/trainer.entity';
import { NutritionCategoryService } from './nutrition-category.service';
import { NutritionPlanService } from './nutrition-plan.service';
import { NutritionDayService } from './nutrition-day.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NutritionCategory,
      NutritionPlan,
      NutritionDay,
      Trainer,
    ]),
  ],
  controllers: [TrainerNutritionController],
  providers: [
    TrainerNutritionService,
    NutritionCategoryService,
    NutritionPlanService,
    NutritionDayService,
  ],
})
export class TrainerNutritionModule {}
