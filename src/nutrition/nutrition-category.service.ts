import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NutritionCategory } from './nutrition-category.entity';
import { CreateNutritionCategoryDto } from './dto/create-nutrition-category.dto';
import { UpdateNutritionCategoryDto } from './dto/update-nutrition-category.dto';

@Injectable()
export class NutritionCategoryService {
  constructor(
    @InjectRepository(NutritionCategory)
    private nutritionCategoryRepository: Repository<NutritionCategory>,
  ) {}

  async findAll(): Promise<NutritionCategory[]> {
    return await this.nutritionCategoryRepository.find({
      order: { name: 'ASC' },
    });
  }

  async create(
    categoryData: CreateNutritionCategoryDto,
  ): Promise<NutritionCategory> {
    const category = new NutritionCategory();
    Object.assign(category, categoryData);

    return await this.nutritionCategoryRepository.save(category);
  }

  async findOne(id: number): Promise<NutritionCategory | null> {
    return await this.nutritionCategoryRepository.findOne({
      where: { id },
    });
  }

  async update(
    id: number,
    categoryData: UpdateNutritionCategoryDto,
  ): Promise<NutritionCategory> {
    const existingCategory = await this.findOne(id);
    if (!existingCategory) {
      throw new NotFoundException(`Nutrition category with ID ${id} not found`);
    }
    await this.nutritionCategoryRepository.update(id, categoryData);
    const updatedCategory = await this.findOne(id);
    if (!updatedCategory) {
      throw new NotFoundException(
        `Nutrition category with ID ${id} not found after update`,
      );
    }
    return updatedCategory;
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    if (!category) {
      throw new NotFoundException(`Nutrition category with ID ${id} not found`);
    }
    await this.nutritionCategoryRepository.delete(id);
  }
}
