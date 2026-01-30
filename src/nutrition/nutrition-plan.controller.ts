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
} from '@nestjs/common';
import { NutritionPlanService } from './nutrition-plan.service';
import { NutritionPlan } from './nutrition-plan.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateNutritionPlanDto } from './dto/create-nutrition-plan.dto';
import { UpdateNutritionPlanDto } from './dto/update-nutrition-plan.dto';

@Controller('nutrition-plans')
export class NutritionPlanController {
  constructor(
    private readonly nutritionPlanService: NutritionPlanService,
  ) {}

  @Get()
  async findAll(): Promise<NutritionPlan[]> {
    return await this.nutritionPlanService.findAll();
  }

  @Get('category/:categoryId')
  async findByCategory(@Param('categoryId') categoryId: number): Promise<NutritionPlan[]> {
    return await this.nutritionPlanService.findByCategoryId(categoryId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createNutritionPlanDto: CreateNutritionPlanDto,
  ): Promise<NutritionPlan> {
    return await this.nutritionPlanService.create(createNutritionPlanDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<NutritionPlan> {
    const plan = await this.nutritionPlanService.findOne(id);
    if (!plan) {
      throw new NotFoundException(`Nutrition plan with ID ${id} not found`);
    }
    return plan;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: number,
    @Body() updateNutritionPlanDto: UpdateNutritionPlanDto,
  ): Promise<NutritionPlan> {
    return await this.nutritionPlanService.update(id, updateNutritionPlanDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: number): Promise<void> {
    await this.nutritionPlanService.remove(id);
  }
}