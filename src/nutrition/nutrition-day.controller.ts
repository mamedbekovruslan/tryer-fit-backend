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
import { NutritionDayService } from './nutrition-day.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateNutritionDayDto } from './dto/create-nutrition-day.dto';
import { UpdateNutritionDayDto } from './dto/update-nutrition-day.dto';
import {
  NutritionDayResponse,
  toNutritionDayResponse,
} from './nutrition-response';

@Controller('nutrition-days')
export class NutritionDayController {
  constructor(private readonly nutritionDayService: NutritionDayService) {}

  @Get()
  async findAll(): Promise<NutritionDayResponse[]> {
    const days = await this.nutritionDayService.findAll();
    return days.map(toNutritionDayResponse);
  }

  @Get('plan/:planId')
  async findByPlan(
    @Param('planId') planId: number,
  ): Promise<NutritionDayResponse[]> {
    const days = await this.nutritionDayService.findByPlanId(planId);
    return days.map(toNutritionDayResponse);
  }

  @Get('category/:categoryId')
  async findByCategory(
    @Param('categoryId') categoryId: number,
  ): Promise<NutritionDayResponse[]> {
    const days = await this.nutritionDayService.findByCategoryId(categoryId);
    return days.map(toNutritionDayResponse);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createNutritionDayDto: CreateNutritionDayDto,
  ): Promise<NutritionDayResponse> {
    const day = await this.nutritionDayService.create(createNutritionDayDto);
    return toNutritionDayResponse(day);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<NutritionDayResponse> {
    const day = await this.nutritionDayService.findOne(id);
    if (!day) {
      throw new NotFoundException(`Nutrition day with ID ${id} not found`);
    }
    return toNutritionDayResponse(day);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: number,
    @Body() updateNutritionDayDto: UpdateNutritionDayDto,
  ): Promise<NutritionDayResponse> {
    const day = await this.nutritionDayService.update(
      id,
      updateNutritionDayDto,
    );
    return toNutritionDayResponse(day);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: number): Promise<void> {
    await this.nutritionDayService.remove(id);
  }
}
