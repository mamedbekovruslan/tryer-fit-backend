import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TrainerNutritionService } from './trainer-nutrition.service';
import { CreateNutritionCategoryDto } from '../nutrition/dto/create-nutrition-category.dto';
import { UpdateNutritionCategoryDto } from '../nutrition/dto/update-nutrition-category.dto';
import { CreateNutritionPlanDto } from '../nutrition/dto/create-nutrition-plan.dto';
import { UpdateNutritionPlanDto } from '../nutrition/dto/update-nutrition-plan.dto';
import { CreateNutritionDayDto } from '../nutrition/dto/create-nutrition-day.dto';
import { UpdateNutritionDayDto } from '../nutrition/dto/update-nutrition-day.dto';
import {
  NutritionCategoryResponse,
  NutritionDayResponse,
  NutritionPlanResponse,
  toNutritionCategoryResponse,
  toNutritionDayResponse,
  toNutritionPlanResponse,
} from './nutrition-response';
import type { AuthenticatedRequest } from '../auth/auth.types';

@Controller('trainer/nutrition')
@UseGuards(JwtAuthGuard)
export class TrainerNutritionController {
  constructor(
    private readonly trainerNutritionService: TrainerNutritionService,
  ) {}

  @Get('categories')
  async getTrainerNutritionCategories(
    @Req() req: AuthenticatedRequest,
  ): Promise<NutritionCategoryResponse[]> {
    const trainerId = req.user.userId;
    const categories =
      await this.trainerNutritionService.getTrainerNutritionCategories(
        trainerId,
      );
    return categories.map(toNutritionCategoryResponse);
  }

  @Post('categories')
  async createNutritionCategory(
    @Req() req: AuthenticatedRequest,
    @Body() createCategoryDto: CreateNutritionCategoryDto,
  ): Promise<NutritionCategoryResponse> {
    const trainerId = req.user.userId;
    const category = await this.trainerNutritionService.createNutritionCategory(
      trainerId,
      createCategoryDto,
    );
    return toNutritionCategoryResponse(category);
  }

  @Put('categories/:id')
  async updateNutritionCategory(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateNutritionCategoryDto,
  ): Promise<NutritionCategoryResponse> {
    const trainerId = req.user.userId;
    const category = await this.trainerNutritionService.updateNutritionCategory(
      trainerId,
      id,
      updateCategoryDto,
    );
    return toNutritionCategoryResponse(category);
  }

  @Delete('categories/:id')
  async deleteNutritionCategory(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    const trainerId = req.user.userId;
    await this.trainerNutritionService.deleteNutritionCategory(trainerId, id);
  }

  @Get('categories/:categoryId/plans')
  async getNutritionPlansByCategory(
    @Req() req: AuthenticatedRequest,
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ): Promise<NutritionPlanResponse[]> {
    const trainerId = req.user.userId;
    const plans =
      await this.trainerNutritionService.getNutritionPlansByCategoryAndTrainer(
        trainerId,
        categoryId,
      );
    return plans.map(toNutritionPlanResponse);
  }

  @Post('plans')
  async createNutritionPlan(
    @Req() req: AuthenticatedRequest,
    @Body() createPlanDto: CreateNutritionPlanDto,
  ): Promise<NutritionPlanResponse> {
    const trainerId = req.user.userId;
    const plan = await this.trainerNutritionService.createNutritionPlan(
      trainerId,
      createPlanDto,
    );
    return toNutritionPlanResponse(plan);
  }

  @Put('plans/:id')
  async updateNutritionPlan(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlanDto: UpdateNutritionPlanDto,
  ): Promise<NutritionPlanResponse> {
    const trainerId = req.user.userId;
    const plan = await this.trainerNutritionService.updateNutritionPlan(
      trainerId,
      id,
      updatePlanDto,
    );
    return toNutritionPlanResponse(plan);
  }

  @Delete('plans/:id')
  async deleteNutritionPlan(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    const trainerId = req.user.userId;
    await this.trainerNutritionService.deleteNutritionPlan(trainerId, id);
  }

  @Get('plans/:planId/days')
  async getNutritionDaysByPlan(
    @Req() req: AuthenticatedRequest,
    @Param('planId', ParseIntPipe) planId: number,
  ): Promise<NutritionDayResponse[]> {
    const trainerId = req.user.userId;
    const days =
      await this.trainerNutritionService.getNutritionDaysByPlanAndTrainer(
        trainerId,
        planId,
      );
    return days.map(toNutritionDayResponse);
  }

  @Post('days')
  async createNutritionDay(
    @Req() req: AuthenticatedRequest,
    @Body() createDayDto: CreateNutritionDayDto,
  ): Promise<NutritionDayResponse> {
    const trainerId = req.user.userId;
    const day = await this.trainerNutritionService.createNutritionDay(
      trainerId,
      createDayDto,
    );
    return toNutritionDayResponse(day);
  }

  @Put('days/:id')
  async updateNutritionDay(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDayDto: UpdateNutritionDayDto,
  ): Promise<NutritionDayResponse> {
    const trainerId = req.user.userId;
    const day = await this.trainerNutritionService.updateNutritionDay(
      trainerId,
      id,
      updateDayDto,
    );
    return toNutritionDayResponse(day);
  }

  @Delete('days/:id')
  async deleteNutritionDay(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    const trainerId = req.user.userId;
    await this.trainerNutritionService.deleteNutritionDay(trainerId, id);
  }
}
