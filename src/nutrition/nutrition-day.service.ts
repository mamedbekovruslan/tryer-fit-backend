import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NutritionDay } from './nutrition-day.entity';
import { NutritionPlan } from './nutrition-plan.entity';
import { CreateNutritionDayDto } from './dto/create-nutrition-day.dto';
import { UpdateNutritionDayDto } from './dto/update-nutrition-day.dto';

@Injectable()
export class NutritionDayService {
  constructor(
    @InjectRepository(NutritionDay)
    private nutritionDayRepository: Repository<NutritionDay>,
    @InjectRepository(NutritionPlan)
    private nutritionPlanRepository: Repository<NutritionPlan>,
  ) {}

  async findAll(): Promise<NutritionDay[]> {
    return await this.nutritionDayRepository.find({
      relations: ['nutritionPlan', 'nutritionPlan.nutritionCategory'],
      order: { name: 'ASC' },
    });
  }

  async findByPlanId(planId: number): Promise<NutritionDay[]> {
    return await this.nutritionDayRepository.find({
      where: { nutritionPlan: { id: planId } },
      relations: ['nutritionPlan', 'nutritionPlan.nutritionCategory', 'meals'],
      order: { name: 'ASC' },
    });
  }

  async findByCategoryId(categoryId: number): Promise<NutritionDay[]> {
    return await this.nutritionDayRepository.find({
      where: { nutritionPlan: { nutritionCategory: { id: categoryId } } },
      relations: ['nutritionPlan', 'nutritionPlan.nutritionCategory', 'meals'],
      order: { name: 'ASC' },
    });
  }

  async create(dayData: CreateNutritionDayDto): Promise<NutritionDay> {
    // Найдем план по ID
    const plan = await this.nutritionPlanRepository.findOne({
      where: { id: dayData.nutritionPlanId },
      relations: ['nutritionCategory'], // Загружаем связанную категорию
    });

    if (!plan) {
      throw new NotFoundException(`Nutrition plan with ID ${dayData.nutritionPlanId} not found`);
    }

    const day = new NutritionDay();
    day.name = dayData.name;
    day.description = dayData.description;
    day.nutritionPlan = plan; // Присваиваем объект плана
    // Автоматически устанавливаем ID категории из плана
    day.nutritionCategoryId = plan.nutritionCategory ? plan.nutritionCategory.id : undefined;

    return await this.nutritionDayRepository.save(day);
  }

  async findOne(id: number): Promise<NutritionDay | null> {
    return await this.nutritionDayRepository.findOne({
      where: { id },
      relations: ['nutritionPlan', 'nutritionPlan.nutritionCategory'],
    });
  }

  async update(id: number, dayData: UpdateNutritionDayDto): Promise<NutritionDay> {
    const existingDay = await this.findOne(id);
    if (!existingDay) {
      throw new NotFoundException(`Nutrition day with ID ${id} not found`);
    }

    // Если передан ID плана, обновим связь
    if (dayData.nutritionPlanId) {
      const plan = await this.nutritionPlanRepository.findOne({
        where: { id: dayData.nutritionPlanId },
        relations: ['nutritionCategory'], // Загружаем связанную категорию
      });

      if (!plan) {
        throw new NotFoundException(`Nutrition plan with ID ${dayData.nutritionPlanId} not found`);
      }

      existingDay.nutritionPlan = plan;
      // Автоматически устанавливаем ID категории из плана
      existingDay.nutritionCategoryId = plan.nutritionCategory ? plan.nutritionCategory.id : undefined;
    }

    existingDay.name = dayData.name ?? existingDay.name;
    existingDay.description = dayData.description ?? existingDay.description;

    await this.nutritionDayRepository.update(id, {
      name: existingDay.name,
      description: existingDay.description,
      nutritionPlan: existingDay.nutritionPlan,
      nutritionCategoryId: existingDay.nutritionCategoryId,
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