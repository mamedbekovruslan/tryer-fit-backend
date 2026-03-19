import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meal } from './meal.entity';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { NutritionDay } from './nutrition-day.entity';

@Injectable()
export class MealService {
  constructor(
    @InjectRepository(Meal)
    private mealRepository: Repository<Meal>,
    @InjectRepository(NutritionDay)
    private nutritionDayRepository: Repository<NutritionDay>,
  ) {}

  async findAll(): Promise<Meal[]> {
    return await this.mealRepository.find({
      relations: ['nutritionDay', 'nutritionDay.nutritionCategory'],
      order: { name: 'ASC' },
    });
  }

  async findByNutritionDayId(nutritionDayId: number): Promise<Meal[]> {
    return await this.mealRepository.find({
      where: { nutritionDay: { id: nutritionDayId } },
      order: { name: 'ASC' },
    });
  }

  async create(mealData: CreateMealDto): Promise<Meal> {
    const nutritionDay = await this.nutritionDayRepository.findOne({
      where: { id: mealData.nutritionDayId },
    });

    if (!nutritionDay) {
      throw new NotFoundException(
        `Nutrition day with ID ${mealData.nutritionDayId} not found`,
      );
    }

    const meal = new Meal();
    meal.name = mealData.name;
    meal.description = mealData.description;
    meal.nutritionDay = nutritionDay; // Присваиваем объект дня питания

    return await this.mealRepository.save(meal);
  }

  async findOne(id: number): Promise<Meal | null> {
    return await this.mealRepository.findOne({
      where: { id },
      relations: ['nutritionDay', 'nutritionDay.nutritionCategory'],
    });
  }

  async update(id: number, mealData: UpdateMealDto): Promise<Meal> {
    const existingMeal = await this.findOne(id);
    if (!existingMeal) {
      throw new NotFoundException(`Meal with ID ${id} not found`);
    }

    if (mealData.nutritionDayId) {
      const nutritionDay = await this.nutritionDayRepository.findOne({
        where: { id: mealData.nutritionDayId },
      });

      if (!nutritionDay) {
        throw new NotFoundException(
          `Nutrition day with ID ${mealData.nutritionDayId} not found`,
        );
      }

      existingMeal.nutritionDay = nutritionDay;
    }

    existingMeal.name = mealData.name ?? existingMeal.name;
    existingMeal.description = mealData.description ?? existingMeal.description;

    await this.mealRepository.update(id, {
      name: existingMeal.name,
      description: existingMeal.description,
      nutritionDay: existingMeal.nutritionDay,
    });

    const updatedMeal = await this.findOne(id);
    if (!updatedMeal) {
      throw new NotFoundException(`Meal with ID ${id} not found after update`);
    }
    return updatedMeal;
  }

  async remove(id: number): Promise<void> {
    const meal = await this.findOne(id);
    if (!meal) {
      throw new NotFoundException(`Meal with ID ${id} not found`);
    }
    await this.mealRepository.delete(id);
  }
}
