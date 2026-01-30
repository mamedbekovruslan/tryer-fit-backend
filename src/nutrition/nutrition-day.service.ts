import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NutritionDay } from './nutrition-day.entity';
import { CreateNutritionDayDto } from './dto/create-nutrition-day.dto';
import { UpdateNutritionDayDto } from './dto/update-nutrition-day.dto';
import { NutritionCategory } from './nutrition-category.entity';

@Injectable()
export class NutritionDayService {
  constructor(
    @InjectRepository(NutritionDay)
    private nutritionDayRepository: Repository<NutritionDay>,
    @InjectRepository(NutritionCategory)
    private nutritionCategoryRepository: Repository<NutritionCategory>,
  ) {}

  async findAll(): Promise<NutritionDay[]> {
    return await this.nutritionDayRepository.find({
      relations: ['nutritionCategory'],
      order: { name: 'ASC' },
    });
  }

  async findByCategoryId(categoryId: number): Promise<NutritionDay[]> {
    return await this.nutritionDayRepository.find({
      where: { nutritionCategory: { id: categoryId } },
      order: { name: 'ASC' },
    });
  }

  async create(dayData: CreateNutritionDayDto): Promise<NutritionDay> {
    // Найдем категорию по ID
    const category = await this.nutritionCategoryRepository.findOne({
      where: { id: dayData.nutritionCategoryId },
    });

    if (!category) {
      throw new NotFoundException(`Nutrition category with ID ${dayData.nutritionCategoryId} not found`);
    }

    const day = new NutritionDay();
    day.name = dayData.name;
    day.description = dayData.description;
    day.nutritionCategory = category; // Присваиваем объект категории

    return await this.nutritionDayRepository.save(day);
  }

  async findOne(id: number): Promise<NutritionDay | null> {
    return await this.nutritionDayRepository.findOne({
      where: { id },
      relations: ['nutritionCategory'],
    });
  }

  async update(id: number, dayData: UpdateNutritionDayDto): Promise<NutritionDay> {
    const existingDay = await this.findOne(id);
    if (!existingDay) {
      throw new NotFoundException(`Nutrition day with ID ${id} not found`);
    }

    // Если передан ID категории, обновим связь
    if (dayData.nutritionCategoryId) {
      const category = await this.nutritionCategoryRepository.findOne({
        where: { id: dayData.nutritionCategoryId },
      });

      if (!category) {
        throw new NotFoundException(`Nutrition category with ID ${dayData.nutritionCategoryId} not found`);
      }

      existingDay.nutritionCategory = category;
    }

    existingDay.name = dayData.name ?? existingDay.name;
    existingDay.description = dayData.description ?? existingDay.description;

    await this.nutritionDayRepository.update(id, {
      name: existingDay.name,
      description: existingDay.description,
      nutritionCategory: existingDay.nutritionCategory,
    });

    const updatedDay = await this.findOne(id);
    if (!updatedDay) {
      throw new NotFoundException(`Nutrition day with ID ${id} not found after update`);
    }
    return updatedDay;
  }

  async remove(id: number): Promise<void> {
    const day = await this.findOne(id);
    if (!day) {
      throw new NotFoundException(`Nutrition day with ID ${id} not found`);
    }
    await this.nutritionDayRepository.delete(id);
  }
}