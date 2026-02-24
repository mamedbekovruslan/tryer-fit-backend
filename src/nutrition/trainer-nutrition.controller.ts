import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TrainerNutritionService } from './trainer-nutrition.service';
import { NutritionCategory } from '../nutrition/nutrition-category.entity';
import { NutritionPlan } from '../nutrition/nutrition-plan.entity';
import { NutritionDay } from '../nutrition/nutrition-day.entity';
import { CreateNutritionCategoryDto } from '../nutrition/dto/create-nutrition-category.dto';
import { UpdateNutritionCategoryDto } from '../nutrition/dto/update-nutrition-category.dto';
import { CreateNutritionPlanDto } from '../nutrition/dto/create-nutrition-plan.dto';
import { UpdateNutritionPlanDto } from '../nutrition/dto/update-nutrition-plan.dto';
import { CreateNutritionDayDto } from '../nutrition/dto/create-nutrition-day.dto';
import { UpdateNutritionDayDto } from '../nutrition/dto/update-nutrition-day.dto';

@Controller('trainer/nutrition')
@UseGuards(JwtAuthGuard)
export class TrainerNutritionController {
  constructor(private readonly trainerNutritionService: TrainerNutritionService) {}

  // Nutrition Categories
  @Get('categories')
  async getTrainerNutritionCategories(@Req() req): Promise<NutritionCategory[]> {
    const trainerId = req.user.userId;
    return await this.trainerNutritionService.getTrainerNutritionCategories(trainerId);
  }

  @Post('categories')
  async createNutritionCategory(
    @Req() req,
    @Body() createCategoryDto: CreateNutritionCategoryDto,
  ): Promise<NutritionCategory> {
    const trainerId = req.user.userId;
    return await this.trainerNutritionService.createNutritionCategory(trainerId, createCategoryDto);
  }

  @Put('categories/:id')
  async updateNutritionCategory(
    @Req() req,
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateNutritionCategoryDto,
  ): Promise<NutritionCategory> {
    const trainerId = req.user.userId;
    return await this.trainerNutritionService.updateNutritionCategory(
      trainerId,
      parseInt(id.toString()),
      updateCategoryDto,
    );
  }

  @Delete('categories/:id')
  async deleteNutritionCategory(@Req() req, @Param('id') id: number): Promise<void> {
    const trainerId = req.user.userId;
    return await this.trainerNutritionService.deleteNutritionCategory(trainerId, parseInt(id.toString()));
  }

  // Nutrition Plans
  @Get('categories/:categoryId/plans')
  async getNutritionPlansByCategory(
    @Req() req,
    @Param('categoryId') categoryId: number,
  ): Promise<NutritionPlan[]> {
    const trainerId = req.user.userId;
    return await this.trainerNutritionService.getNutritionPlansByCategoryAndTrainer(
      trainerId,
      parseInt(categoryId.toString()),
    );
  }

  @Post('plans')
  async createNutritionPlan(
    @Req() req,
    @Body() createPlanDto: CreateNutritionPlanDto,
  ): Promise<NutritionPlan> {
    const trainerId = req.user.userId;
    return await this.trainerNutritionService.createNutritionPlan(trainerId, createPlanDto);
  }

  @Put('plans/:id')
  async updateNutritionPlan(
    @Req() req,
    @Param('id') id: number,
    @Body() updatePlanDto: UpdateNutritionPlanDto,
  ): Promise<NutritionPlan> {
    const trainerId = req.user.userId;
    return await this.trainerNutritionService.updateNutritionPlan(
      trainerId,
      parseInt(id.toString()),
      updatePlanDto,
    );
  }

  @Delete('plans/:id')
  async deleteNutritionPlan(@Req() req, @Param('id') id: number): Promise<void> {
    const trainerId = req.user.userId;
    return await this.trainerNutritionService.deleteNutritionPlan(trainerId, parseInt(id.toString()));
  }

  // Nutrition Days
  @Get('plans/:planId/days')
  async getNutritionDaysByPlan(
    @Req() req,
    @Param('planId') planId: number,
  ): Promise<NutritionDay[]> {
    const trainerId = req.user.userId;
    return await this.trainerNutritionService.getNutritionDaysByPlanAndTrainer(
      trainerId,
      parseInt(planId.toString()),
    );
  }

  @Post('days')
  async createNutritionDay(
    @Req() req,
    @Body() createDayDto: CreateNutritionDayDto,
  ): Promise<NutritionDay> {
    const trainerId = req.user.userId;
    return await this.trainerNutritionService.createNutritionDay(trainerId, createDayDto);
  }

  @Put('days/:id')
  async updateNutritionDay(
    @Req() req,
    @Param('id') id: number,
    @Body() updateDayDto: UpdateNutritionDayDto,
  ): Promise<NutritionDay> {
    const trainerId = req.user.userId;
    return await this.trainerNutritionService.updateNutritionDay(
      trainerId,
      parseInt(id.toString()),
      updateDayDto,
    );
  }

  @Delete('days/:id')
  async deleteNutritionDay(@Req() req, @Param('id') id: number): Promise<void> {
    const trainerId = req.user.userId;
    return await this.trainerNutritionService.deleteNutritionDay(trainerId, parseInt(id.toString()));
  }
}