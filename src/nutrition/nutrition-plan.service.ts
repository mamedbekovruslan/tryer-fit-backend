import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NutritionPlan } from './nutrition-plan.entity';
import { CreateNutritionPlanDto } from './dto/create-nutrition-plan.dto';
import { UpdateNutritionPlanDto } from './dto/update-nutrition-plan.dto';

@Injectable()
export class NutritionPlanService {
  constructor(
    @InjectRepository(NutritionPlan)
    private nutritionPlanRepository: Repository<NutritionPlan>,
  ) {}

  async findAll(): Promise<NutritionPlan[]> {
    return await this.nutritionPlanRepository.find({
      relations: ['nutritionCategory'],
      order: { name: 'ASC' },
    });
  }

  async findByCategoryId(categoryId: number): Promise<NutritionPlan[]> {
    return await this.nutritionPlanRepository.find({
      where: { nutritionCategory: { id: categoryId } },
      order: { name: 'ASC' },
    });
  }

  async create(planData: CreateNutritionPlanDto): Promise<NutritionPlan> {
    const plan = new NutritionPlan();
    Object.assign(plan, planData);
    
    return await this.nutritionPlanRepository.save(plan);
  }

  async findOne(id: number): Promise<NutritionPlan | null> {
    return await this.nutritionPlanRepository.findOne({
      where: { id },
      relations: ['nutritionCategory'],
    });
  }

  async update(id: number, planData: UpdateNutritionPlanDto): Promise<NutritionPlan> {
    const existingPlan = await this.findOne(id);
    if (!existingPlan) {
      throw new NotFoundException(`Nutrition plan with ID ${id} not found`);
    }
    await this.nutritionPlanRepository.update(id, planData);
    const updatedPlan = await this.findOne(id);
    if (!updatedPlan) {
      throw new NotFoundException(`Nutrition plan with ID ${id} not found after update`);
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