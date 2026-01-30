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
import { NutritionCategoryService } from './nutrition-category.service';
import { NutritionCategory } from './nutrition-category.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateNutritionCategoryDto } from './dto/create-nutrition-category.dto';
import { UpdateNutritionCategoryDto } from './dto/update-nutrition-category.dto';

@Controller('nutrition-categories')
export class NutritionCategoryController {
  constructor(
    private readonly nutritionCategoryService: NutritionCategoryService,
  ) {}

  @Get()
  async findAll(): Promise<NutritionCategory[]> {
    return await this.nutritionCategoryService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createNutritionCategoryDto: CreateNutritionCategoryDto,
  ): Promise<NutritionCategory> {
    return await this.nutritionCategoryService.create(createNutritionCategoryDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<NutritionCategory> {
    const category = await this.nutritionCategoryService.findOne(id);
    if (!category) {
      throw new NotFoundException(`Nutrition category with ID ${id} not found`);
    }
    return category;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: number,
    @Body() updateNutritionCategoryDto: UpdateNutritionCategoryDto,
  ): Promise<NutritionCategory> {
    return await this.nutritionCategoryService.update(id, updateNutritionCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: number): Promise<void> {
    await this.nutritionCategoryService.remove(id);
  }
}