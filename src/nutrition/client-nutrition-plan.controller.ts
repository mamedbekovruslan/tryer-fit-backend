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
import { ClientNutritionPlanService } from './client-nutrition-plan.service';
import { ClientNutritionPlan } from './client-nutrition-plan.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateClientNutritionPlanDto } from './dto/create-client-nutrition-plan.dto';
import { UpdateClientNutritionPlanDto } from './dto/update-client-nutrition-plan.dto';

@Controller('client-nutrition-plans')
export class ClientNutritionPlanController {
  constructor(
    private readonly clientNutritionPlanService: ClientNutritionPlanService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<ClientNutritionPlan[]> {
    return await this.clientNutritionPlanService.findAll();
  }

  @Get('client/:clientId')
  @UseGuards(JwtAuthGuard)
  async findByClient(@Param('clientId') clientId: number): Promise<ClientNutritionPlan[]> {
    return await this.clientNutritionPlanService.findByClientId(clientId);
  }

  @Get('client/:clientId/active')
  async findByClientAndActive(@Param('clientId') clientId: number): Promise<ClientNutritionPlan[]> {
    return await this.clientNutritionPlanService.findByClientIdAndActive(clientId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createClientNutritionPlanDto: CreateClientNutritionPlanDto,
  ): Promise<ClientNutritionPlan> {
    return await this.clientNutritionPlanService.create(createClientNutritionPlanDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: number): Promise<ClientNutritionPlan> {
    const plan = await this.clientNutritionPlanService.findOne(id);
    if (!plan) {
      throw new NotFoundException(`Client nutrition plan with ID ${id} not found`);
    }
    return plan;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: number,
    @Body() updateClientNutritionPlanDto: UpdateClientNutritionPlanDto,
  ): Promise<ClientNutritionPlan> {
    return await this.clientNutritionPlanService.update(id, updateClientNutritionPlanDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: number): Promise<void> {
    await this.clientNutritionPlanService.remove(id);
  }
}