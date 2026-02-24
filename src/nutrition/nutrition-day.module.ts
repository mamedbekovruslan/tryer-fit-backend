import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutritionDay } from './nutrition-day.entity';
import { NutritionDayService } from './nutrition-day.service';
import { NutritionDayController } from './nutrition-day.controller';
import { NutritionPlan } from './nutrition-plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NutritionDay, NutritionPlan])],
  providers: [NutritionDayService],
  controllers: [NutritionDayController],
  exports: [NutritionDayService],
})
export class NutritionDayModule {}