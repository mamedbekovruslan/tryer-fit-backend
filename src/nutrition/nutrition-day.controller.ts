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
import { NutritionDay } from './nutrition-day.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateNutritionDayDto } from './dto/create-nutrition-day.dto';
import { UpdateNutritionDayDto } from './dto/update-nutrition-day.dto';

@Controller('nutrition-days')
export class NutritionDayController {
  constructor(
    private readonly nutritionDayService: NutritionDayService,
  ) {}

  @Get()
  async findAll(): Promise<NutritionDay[]> {
    return await this.nutritionDayService.findAll();
  }

  @Get('category/:categoryId')
  async findByCategory(@Param('categoryId') categoryId: number): Promise<NutritionDay[]> {
    return await this.nutritionDayService.findByCategoryId(categoryId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createNutritionDayDto: CreateNutritionDayDto,
  ): Promise<NutritionDay> {
    return await this.nutritionDayService.create(createNutritionDayDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<NutritionDay> {
    const day = await this.nutritionDayService.findOne(id);
    if (!day) {
      throw new NotFoundException(`Nutrition day with ID ${id} not found`);
    }
    return day;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: number,
    @Body() updateNutritionDayDto: UpdateNutritionDayDto,
  ): Promise<NutritionDay> {
    return await this.nutritionDayService.update(id, updateNutritionDayDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: number): Promise<void> {
    await this.nutritionDayService.remove(id);
  }
}