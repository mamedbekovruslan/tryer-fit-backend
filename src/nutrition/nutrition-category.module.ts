import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutritionCategory } from './nutrition-category.entity';
import { NutritionCategoryService } from './nutrition-category.service';
import { NutritionCategoryController } from './nutrition-category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NutritionCategory])],
  providers: [NutritionCategoryService],
  controllers: [NutritionCategoryController],
  exports: [NutritionCategoryService],
})
export class NutritionCategoryModule {}
