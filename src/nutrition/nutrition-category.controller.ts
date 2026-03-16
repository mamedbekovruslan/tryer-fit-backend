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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateNutritionCategoryDto } from './dto/create-nutrition-category.dto';
import { UpdateNutritionCategoryDto } from './dto/update-nutrition-category.dto';
import {
  NutritionCategoryResponse,
  toNutritionCategoryResponse,
} from './nutrition-response';

@Controller('nutrition-categories')
export class NutritionCategoryController {
  constructor(
    private readonly nutritionCategoryService: NutritionCategoryService,
  ) {}

  @Get()
  async findAll(): Promise<NutritionCategoryResponse[]> {
    const categories = await this.nutritionCategoryService.findAll();
    return categories.map(toNutritionCategoryResponse);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createNutritionCategoryDto: CreateNutritionCategoryDto,
  ): Promise<NutritionCategoryResponse> {
    const category = await this.nutritionCategoryService.create(
      createNutritionCategoryDto,
    );
    return toNutritionCategoryResponse(category);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<NutritionCategoryResponse> {
    const category = await this.nutritionCategoryService.findOne(id);
    if (!category) {
      throw new NotFoundException(`Nutrition category with ID ${id} not found`);
    }
    return toNutritionCategoryResponse(category);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: number,
    @Body() updateNutritionCategoryDto: UpdateNutritionCategoryDto,
  ): Promise<NutritionCategoryResponse> {
    const category = await this.nutritionCategoryService.update(
      id,
      updateNutritionCategoryDto,
    );
    return toNutritionCategoryResponse(category);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: number): Promise<void> {
    await this.nutritionCategoryService.remove(id);
  }
}
