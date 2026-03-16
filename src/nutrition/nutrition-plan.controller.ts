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
  ParseIntPipe,
} from '@nestjs/common';
import { NutritionPlanService } from './nutrition-plan.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateNutritionPlanDto } from './dto/create-nutrition-plan.dto';
import { UpdateNutritionPlanDto } from './dto/update-nutrition-plan.dto';
import {
  NutritionPlanResponse,
  toNutritionPlanResponse,
} from './nutrition-response';
import type { AuthenticatedRequest } from '../auth/auth.types';

@Controller('nutrition-plans')
export class NutritionPlanController {
  constructor(private readonly nutritionPlanService: NutritionPlanService) {}

  @Get()
  async findAll(): Promise<NutritionPlanResponse[]> {
    const plans = await this.nutritionPlanService.findAll();
    return plans.map(toNutritionPlanResponse);
  }

  @Get('trainer/:trainerId')
  async findByTrainer(
    @Param('trainerId') trainerId: number,
  ): Promise<NutritionPlanResponse[]> {
    const plans = await this.nutritionPlanService.findByTrainerId(trainerId);
    return plans.map(toNutritionPlanResponse);
  }

  @Get('category/:categoryId')
  async findByCategory(
    @Param('categoryId') categoryId: number,
  ): Promise<NutritionPlanResponse[]> {
    const plans = await this.nutritionPlanService.findByCategoryId(categoryId);
    return plans.map(toNutritionPlanResponse);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() createNutritionPlanDto: CreateNutritionPlanDto,
  ): Promise<NutritionPlanResponse> {
    const trainerId = req.user.userId;
    const plan = await this.nutritionPlanService.create(
      createNutritionPlanDto,
      trainerId,
    );
    return toNutritionPlanResponse(plan);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<NutritionPlanResponse> {
    const plan = await this.nutritionPlanService.findOne(id);
    if (!plan) {
      throw new NotFoundException(`Nutrition plan with ID ${id} not found`);
    }
    return toNutritionPlanResponse(plan);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNutritionPlanDto: UpdateNutritionPlanDto,
  ): Promise<NutritionPlanResponse> {
    const plan = await this.nutritionPlanService.update(
      id,
      updateNutritionPlanDto,
    );
    return toNutritionPlanResponse(plan);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.nutritionPlanService.remove(id);
  }
}
