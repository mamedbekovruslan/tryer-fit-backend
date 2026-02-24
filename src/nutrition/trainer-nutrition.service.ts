import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NutritionCategory } from './nutrition-category.entity';
import { NutritionPlan } from './nutrition-plan.entity';
import { NutritionDay } from './nutrition-day.entity';
import { CreateNutritionCategoryDto } from './dto/create-nutrition-category.dto';
import { UpdateNutritionCategoryDto } from './dto/update-nutrition-category.dto';
import { CreateNutritionPlanDto } from './dto/create-nutrition-plan.dto';
import { UpdateNutritionPlanDto } from './dto/update-nutrition-plan.dto';
import { CreateNutritionDayDto } from './dto/create-nutrition-day.dto';
import { UpdateNutritionDayDto } from './dto/update-nutrition-day.dto';
import { Trainer } from '../users/trainer.entity';

@Injectable()
export class TrainerNutritionService {
  constructor(
    @InjectRepository(NutritionCategory)
    private nutritionCategoryRepository: Repository<NutritionCategory>,
    @InjectRepository(NutritionPlan)
    private nutritionPlanRepository: Repository<NutritionPlan>,
    @InjectRepository(NutritionDay)
    private nutritionDayRepository: Repository<NutritionDay>,
    @InjectRepository(Trainer)
    private trainerRepository: Repository<Trainer>,
  ) {}

  // Nutrition Categories
  async getTrainerNutritionCategories(trainerId: number): Promise<NutritionCategory[]> {
    // Since categories are shared among all trainers, we just return all categories
    // In a real implementation, you might want to track which trainer created which category
    return await this.nutritionCategoryRepository.find({
      order: { name: 'ASC' },
    });
  }

  async createNutritionCategory(
    trainerId: number,
    createCategoryDto: CreateNutritionCategoryDto,
  ): Promise<NutritionCategory> {
    // Verify trainer exists
    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    const category = new NutritionCategory();
    category.name = createCategoryDto.name;
    category.description = createCategoryDto.description;

    return await this.nutritionCategoryRepository.save(category);
  }

  async updateNutritionCategory(
    trainerId: number,
    categoryId: number,
    updateCategoryDto: UpdateNutritionCategoryDto,
  ): Promise<NutritionCategory> {
    const category = await this.nutritionCategoryRepository.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundException(`Nutrition category with ID ${categoryId} not found`);
    }

    // Verify trainer exists
    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    category.name = updateCategoryDto.name ?? category.name;
    category.description = updateCategoryDto.description ?? category.description;

    return await this.nutritionCategoryRepository.save(category);
  }

  async deleteNutritionCategory(trainerId: number, categoryId: number): Promise<void> {
    const category = await this.nutritionCategoryRepository.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundException(`Nutrition category with ID ${categoryId} not found`);
    }

    // Verify trainer exists
    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    // Check if there are any plans associated with this category
    const plansCount = await this.nutritionPlanRepository.count({
      where: { nutritionCategory: { id: categoryId } },
    });

    if (plansCount > 0) {
      throw new ForbiddenException(
        `Cannot delete nutrition category with ID ${categoryId} because it has associated nutrition plans`,
      );
    }

    await this.nutritionCategoryRepository.delete(categoryId);
  }

  // Nutrition Plans
  async getNutritionPlansByCategoryAndTrainer(
    trainerId: number,
    categoryId: number,
  ): Promise<NutritionPlan[]> {
    // Verify trainer exists
    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    // Verify category exists
    const category = await this.nutritionCategoryRepository.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundException(`Nutrition category with ID ${categoryId} not found`);
    }

    return await this.nutritionPlanRepository.find({
      where: { 
        nutritionCategory: { id: categoryId },
        trainer: { id: trainerId }
      },
      relations: ['nutritionCategory', 'trainer'],
      order: { name: 'ASC' },
    });
  }

  async createNutritionPlan(
    trainerId: number,
    createPlanDto: CreateNutritionPlanDto,
  ): Promise<NutritionPlan> {
    // Verify trainer exists
    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    // Verify category exists
    const category = await this.nutritionCategoryRepository.findOne({
      where: { id: createPlanDto.nutritionCategoryId },
    });
    if (!category) {
      throw new NotFoundException(`Nutrition category with ID ${createPlanDto.nutritionCategoryId} not found`);
    }

    const plan = new NutritionPlan();
    plan.name = createPlanDto.name;
    plan.description = createPlanDto.description;
    plan.nutritionCategory = category;
    plan.trainer = trainer;

    return await this.nutritionPlanRepository.save(plan);
  }

  async updateNutritionPlan(
    trainerId: number,
    planId: number,
    updatePlanDto: UpdateNutritionPlanDto,
  ): Promise<NutritionPlan> {
    const plan = await this.nutritionPlanRepository.findOne({
      where: { id: planId },
      relations: ['nutritionCategory', 'trainer'],
    });
    if (!plan) {
      throw new NotFoundException(`Nutrition plan with ID ${planId} not found`);
    }

    // Verify trainer exists
    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    // Verify the plan belongs to the trainer
    if (plan.trainer && plan.trainer.id !== trainerId) {
      throw new ForbiddenException(`You don't have permission to update this nutrition plan`);
    }

    // If a new category ID is provided, verify it exists
    if (updatePlanDto.nutritionCategoryId) {
      const category = await this.nutritionCategoryRepository.findOne({
        where: { id: updatePlanDto.nutritionCategoryId },
      });
      if (!category) {
        throw new NotFoundException(`Nutrition category with ID ${updatePlanDto.nutritionCategoryId} not found`);
      }
      plan.nutritionCategory = category;
    }

    plan.name = updatePlanDto.name ?? plan.name;
    plan.description = updatePlanDto.description ?? plan.description;

    return await this.nutritionPlanRepository.save(plan);
  }

  async deleteNutritionPlan(trainerId: number, planId: number): Promise<void> {
    const plan = await this.nutritionPlanRepository.findOne({
      where: { id: planId },
      relations: ['nutritionCategory', 'trainer'],
    });
    if (!plan) {
      throw new NotFoundException(`Nutrition plan with ID ${planId} not found`);
    }

    // Verify trainer exists
    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    // Verify the plan belongs to the trainer
    if (plan.trainer && plan.trainer.id !== trainerId) {
      throw new ForbiddenException(`You don't have permission to delete this nutrition plan`);
    }

    // Check if there are any days associated with this plan
    const daysCount = await this.nutritionDayRepository.count({
      where: { nutritionPlan: { id: planId } },
    });

    if (daysCount > 0) {
      throw new ForbiddenException(
        `Cannot delete nutrition plan with ID ${planId} because it has associated nutrition days`,
      );
    }

    await this.nutritionPlanRepository.delete(planId);
  }

  // Nutrition Days
  async getNutritionDaysByPlanAndTrainer(
    trainerId: number,
    planId: number,
  ): Promise<NutritionDay[]> {
    // Verify trainer exists
    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    // Verify plan exists and belongs to the trainer
    const plan = await this.nutritionPlanRepository.findOne({
      where: { id: planId },
      relations: ['nutritionCategory', 'trainer'],
    });
    if (!plan) {
      throw new NotFoundException(`Nutrition plan with ID ${planId} not found`);
    }

    if (plan.trainer && plan.trainer.id !== trainerId) {
      throw new ForbiddenException(`You don't have permission to access this nutrition plan`);
    }

    return await this.nutritionDayRepository.find({
      where: { nutritionPlan: { id: planId } },
      relations: ['nutritionPlan', 'meals'],
      order: { name: 'ASC' },
    });
  }

  async createNutritionDay(
    trainerId: number,
    createDayDto: CreateNutritionDayDto,
  ): Promise<NutritionDay> {
    // Verify trainer exists
    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    // Verify plan exists and belongs to the trainer
    const plan = await this.nutritionPlanRepository.findOne({
      where: { id: createDayDto.nutritionPlanId },
      relations: ['nutritionCategory', 'trainer'],
    });
    if (!plan) {
      throw new NotFoundException(`Nutrition plan with ID ${createDayDto.nutritionPlanId} not found`);
    }

    if (plan.trainer && plan.trainer.id !== trainerId) {
      throw new ForbiddenException(`You don't have permission to add days to this nutrition plan`);
    }

    const day = new NutritionDay();
    day.name = createDayDto.name;
    day.description = createDayDto.description;
    day.nutritionPlan = plan;

    return await this.nutritionDayRepository.save(day);
  }

  async updateNutritionDay(
    trainerId: number,
    dayId: number,
    updateDayDto: UpdateNutritionDayDto,
  ): Promise<NutritionDay> {
    const day = await this.nutritionDayRepository.findOne({
      where: { id: dayId },
      relations: ['nutritionPlan'],
    });
    if (!day) {
      throw new NotFoundException(`Nutrition day with ID ${dayId} not found`);
    }

    // Verify trainer exists
    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    // Verify the plan belongs to the trainer
    if (day.nutritionPlan.trainer && day.nutritionPlan.trainer.id !== trainerId) {
      throw new ForbiddenException(`You don't have permission to update this nutrition day`);
    }

    // If a new plan ID is provided, verify it exists and belongs to the trainer
    if (updateDayDto.nutritionPlanId) {
      const plan = await this.nutritionPlanRepository.findOne({
        where: { id: updateDayDto.nutritionPlanId },
        relations: ['nutritionCategory', 'trainer'],
      });
      if (!plan) {
        throw new NotFoundException(`Nutrition plan with ID ${updateDayDto.nutritionPlanId} not found`);
      }

      if (plan.trainer && plan.trainer.id !== trainerId) {
        throw new ForbiddenException(`You don't have permission to use this nutrition plan`);
      }
      day.nutritionPlan = plan;
    }

    day.name = updateDayDto.name ?? day.name;
    day.description = updateDayDto.description ?? day.description;

    return await this.nutritionDayRepository.save(day);
  }

  async deleteNutritionDay(trainerId: number, dayId: number): Promise<void> {
    const day = await this.nutritionDayRepository.findOne({
      where: { id: dayId },
      relations: ['nutritionPlan'],
    });
    if (!day) {
      throw new NotFoundException(`Nutrition day with ID ${dayId} not found`);
    }

    // Verify trainer exists
    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    // Verify the plan belongs to the trainer
    if (day.nutritionPlan.trainer && day.nutritionPlan.trainer.id !== trainerId) {
      throw new ForbiddenException(`You don't have permission to delete this nutrition day`);
    }

    await this.nutritionDayRepository.delete(dayId);
  }
}