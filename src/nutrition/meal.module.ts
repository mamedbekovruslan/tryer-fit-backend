import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meal } from './meal.entity';
import { MealService } from './meal.service';
import { MealController } from './meal.controller';
import { NutritionDay } from './nutrition-day.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Meal, NutritionDay])],
  providers: [MealService],
  controllers: [MealController],
  exports: [MealService],
})
export class MealModule {}