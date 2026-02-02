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
import { MealService } from './meal.service';
import { Meal } from './meal.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';

@Controller('meals')
export class MealController {
  constructor(private readonly mealService: MealService) {}

  @Get()
  async findAll(): Promise<Meal[]> {
    return await this.mealService.findAll();
  }

  @Get('day/:nutritionDayId')
  async findByNutritionDay(@Param('nutritionDayId') nutritionDayId: number): Promise<Meal[]> {
    return await this.mealService.findByNutritionDayId(nutritionDayId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createMealDto: CreateMealDto): Promise<Meal> {
    return await this.mealService.create(createMealDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Meal> {
    const meal = await this.mealService.findOne(id);
    if (!meal) {
      throw new NotFoundException(`Meal with ID ${id} not found`);
    }
    return meal;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: number,
    @Body() updateMealDto: UpdateMealDto,
  ): Promise<Meal> {
    return await this.mealService.update(id, updateMealDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: number): Promise<void> {
    await this.mealService.remove(id);
  }
}