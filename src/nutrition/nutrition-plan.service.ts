import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NutritionPlan } from './nutrition-plan.entity';
import { NutritionCategory } from './nutrition-category.entity';
import { CreateNutritionPlanDto } from './dto/create-nutrition-plan.dto';
import { UpdateNutritionPlanDto } from './dto/update-nutrition-plan.dto';
import { Trainer } from '../users/trainer.entity';

@Injectable()
export class NutritionPlanService {
  constructor(
    @InjectRepository(NutritionPlan)
    private nutritionPlanRepository: Repository<NutritionPlan>,
    @InjectRepository(Trainer)
    private trainerRepository: Repository<Trainer>,
    @InjectRepository(NutritionCategory)
    private nutritionCategoryRepository: Repository<NutritionCategory>,
  ) {}

  async findAll(): Promise<NutritionPlan[]> {
    return await this.nutritionPlanRepository.find({
      relations: ['nutritionCategory', 'trainer'],
      order: { name: 'ASC' },
    });
  }

  async findByTrainerId(trainerId: number): Promise<NutritionPlan[]> {
    return await this.nutritionPlanRepository.find({
      where: { trainer: { id: trainerId } },
      relations: ['nutritionCategory', 'trainer'],
      order: { name: 'ASC' },
    });
  }

  async findByCategoryId(categoryId: number): Promise<NutritionPlan[]> {
    return await this.nutritionPlanRepository.find({
      where: { nutritionCategory: { id: categoryId } },
      relations: ['nutritionCategory', 'trainer'],
      order: { name: 'ASC' },
    });
  }

  async create(
    planData: CreateNutritionPlanDto,
    trainerId?: number,
  ): Promise<NutritionPlan> {
    const category = await this.nutritionCategoryRepository.findOne({
      where: { id: planData.nutritionCategoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Nutrition category with ID ${planData.nutritionCategoryId} not found`,
      );
    }

    let trainer: Trainer | null = null;
    if (trainerId) {
      trainer = await this.trainerRepository.findOne({
        where: { id: trainerId },
      });
      if (!trainer) {
        throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
      }
    }

    const plan = new NutritionPlan();
    plan.name = planData.name;
    plan.description = planData.description;
    plan.nutritionCategory = category;
    if (trainer) {
      plan.trainer = trainer;
    }

    const savedPlan = await this.nutritionPlanRepository.save(plan);

    const result = await this.nutritionPlanRepository.findOne({
      where: { id: savedPlan.id },
      relations: ['nutritionCategory', 'trainer'],
    });

    if (!result) {
      throw new NotFoundException(
        `Created nutrition plan with ID ${savedPlan.id} not found after creation`,
      );
    }

    return result;
  }

  async findOne(id: number): Promise<NutritionPlan | null> {
    return await this.nutritionPlanRepository.findOne({
      where: { id },
      relations: ['nutritionCategory'],
    });
  }

  async update(
    id: number,
    planData: UpdateNutritionPlanDto,
  ): Promise<NutritionPlan> {
    const existingPlan = await this.findOne(id);
    if (!existingPlan) {
      throw new NotFoundException(`Nutrition plan with ID ${id} not found`);
    }

    if (planData.nutritionCategoryId) {
      const category = await this.nutritionCategoryRepository.findOne({
        where: { id: planData.nutritionCategoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Nutrition category with ID ${planData.nutritionCategoryId} not found`,
        );
      }

      existingPlan.nutritionCategory = category;
    }

    existingPlan.name = planData.name ?? existingPlan.name;
    existingPlan.description = planData.description ?? existingPlan.description;

    await this.nutritionPlanRepository.update(id, {
      name: existingPlan.name,
      description: existingPlan.description,
      nutritionCategory: existingPlan.nutritionCategory,
    });

    const updatedPlan = await this.findOne(id);
    if (!updatedPlan) {
      throw new NotFoundException(
        `Nutrition plan with ID ${id} not found after update`,
      );
    }
    return updatedPlan;
  }

  async remove(id: number): Promise<void> {
    const plan = await this.findOne(id);
    if (!plan) {
      throw new NotFoundException(`Nutrition plan with ID ${id} not found`);
    }
    await this.nutritionPlanRepository.delete(id);
  }
}
