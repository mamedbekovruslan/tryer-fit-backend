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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { MealResponse, toMealResponse } from './nutrition-response';

@Controller('meals')
export class MealController {
  constructor(private readonly mealService: MealService) {}

  @Get()
  async findAll(): Promise<MealResponse[]> {
    const meals = await this.mealService.findAll();
    return meals.map(toMealResponse);
  }

  @Get('day/:nutritionDayId')
  async findByNutritionDay(
    @Param('nutritionDayId') nutritionDayId: number,
  ): Promise<MealResponse[]> {
    const meals = await this.mealService.findByNutritionDayId(nutritionDayId);
    return meals.map(toMealResponse);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createMealDto: CreateMealDto): Promise<MealResponse> {
    const meal = await this.mealService.create(createMealDto);
    return toMealResponse(meal);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<MealResponse> {
    const meal = await this.mealService.findOne(id);
    if (!meal) {
      throw new NotFoundException(`Meal with ID ${id} not found`);
    }
    return toMealResponse(meal);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: number,
    @Body() updateMealDto: UpdateMealDto,
  ): Promise<MealResponse> {
    const meal = await this.mealService.update(id, updateMealDto);
    return toMealResponse(meal);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: number): Promise<void> {
    await this.mealService.remove(id);
  }
}
