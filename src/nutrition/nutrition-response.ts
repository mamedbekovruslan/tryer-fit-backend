import { NutritionCategory } from './nutrition-category.entity';
import { NutritionPlan } from './nutrition-plan.entity';
import { NutritionDay } from './nutrition-day.entity';
import { Meal } from './meal.entity';
import { ClientNutritionPlan } from './client-nutrition-plan.entity';
import {
  ClientResponse,
  toClientResponse,
  TrainerResponse,
  toTrainerResponse,
} from '../users/user-response';

export interface NutritionCategoryResponse {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NutritionPlanResponse {
  id: number;
  name: string;
  description?: string;
  nutritionCategory?: NutritionCategoryResponse;
  trainer?: TrainerResponse;
  createdAt: Date;
  updatedAt: Date;
}

export interface MealResponse {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NutritionDayResponse {
  id: number;
  name: string;
  description?: string;
  nutritionCategoryId?: number;
  nutritionPlan?: NutritionPlanResponse;
  meals?: MealResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientNutritionPlanResponse {
  id: number;
  client?: ClientResponse;
  nutritionPlan?: NutritionPlanResponse;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  assignedAt: Date;
  updatedAt: Date;
}

export function toNutritionCategoryResponse(
  category: NutritionCategory,
): NutritionCategoryResponse {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export function toNutritionPlanResponse(
  plan: NutritionPlan,
): NutritionPlanResponse {
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    nutritionCategory: plan.nutritionCategory
      ? toNutritionCategoryResponse(plan.nutritionCategory)
      : undefined,
    trainer: plan.trainer ? toTrainerResponse(plan.trainer) : undefined,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
}

export function toMealResponse(meal: Meal): MealResponse {
  return {
    id: meal.id,
    name: meal.name,
    description: meal.description,
    createdAt: meal.createdAt,
    updatedAt: meal.updatedAt,
  };
}

export function toNutritionDayResponse(
  day: NutritionDay,
): NutritionDayResponse {
  return {
    id: day.id,
    name: day.name,
    description: day.description,
    nutritionCategoryId: day.nutritionCategoryId,
    nutritionPlan: day.nutritionPlan
      ? toNutritionPlanResponse(day.nutritionPlan)
      : undefined,
    meals: day.meals?.map(toMealResponse),
    createdAt: day.createdAt,
    updatedAt: day.updatedAt,
  };
}

export function toClientNutritionPlanResponse(
  plan: ClientNutritionPlan,
): ClientNutritionPlanResponse {
  return {
    id: plan.id,
    client: plan.client ? toClientResponse(plan.client) : undefined,
    nutritionPlan: plan.nutritionPlan
      ? toNutritionPlanResponse(plan.nutritionPlan)
      : undefined,
    isActive: plan.is_active,
    assignedAt: plan.assignedAt,
    updatedAt: plan.updatedAt,
  };
}
