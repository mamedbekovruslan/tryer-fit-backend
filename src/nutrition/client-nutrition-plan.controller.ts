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
  Request,
} from '@nestjs/common';
import { ClientNutritionPlanService } from './client-nutrition-plan.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateClientNutritionPlanDto } from './dto/create-client-nutrition-plan.dto';
import { UpdateClientNutritionPlanDto } from './dto/update-client-nutrition-plan.dto';
import {
  ClientNutritionPlanResponse,
  toClientNutritionPlanResponse,
} from './nutrition-response';
import { AccessControlService } from '../auth/access-control.service';
import type { AuthenticatedRequest } from '../auth/auth.types';

@Controller('client-nutrition-plans')
export class ClientNutritionPlanController {
  constructor(
    private readonly clientNutritionPlanService: ClientNutritionPlanService,
    private readonly accessControlService: AccessControlService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<ClientNutritionPlanResponse[]> {
    const plans = await this.clientNutritionPlanService.findAll();
    return plans.map(toClientNutritionPlanResponse);
  }

  @Get('client/:clientId')
  @UseGuards(JwtAuthGuard)
  async findByClient(
    @Request() req: AuthenticatedRequest,
    @Param('clientId') clientId: number,
  ): Promise<ClientNutritionPlanResponse[]> {
    await this.accessControlService.assertUserCanAccessClient(
      req.user,
      clientId,
    );
    const plans =
      await this.clientNutritionPlanService.findByClientId(clientId);
    return plans.map(toClientNutritionPlanResponse);
  }

  @Get('client/:clientId/active')
  @UseGuards(JwtAuthGuard)
  async findByClientAndActive(
    @Request() req: AuthenticatedRequest,
    @Param('clientId') clientId: number,
  ): Promise<ClientNutritionPlanResponse[]> {
    await this.accessControlService.assertUserCanAccessClient(
      req.user,
      clientId,
    );
    const plans =
      await this.clientNutritionPlanService.findByClientIdAndActive(clientId);
    return plans.map(toClientNutritionPlanResponse);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createClientNutritionPlanDto: CreateClientNutritionPlanDto,
  ): Promise<ClientNutritionPlanResponse> {
    const plan = await this.clientNutritionPlanService.create(
      createClientNutritionPlanDto,
    );
    return toClientNutritionPlanResponse(plan);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: number): Promise<ClientNutritionPlanResponse> {
    const plan = await this.clientNutritionPlanService.findOne(id);
    if (!plan) {
      throw new NotFoundException(
        `Client nutrition plan with ID ${id} not found`,
      );
    }
    return toClientNutritionPlanResponse(plan);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: number,
    @Body() updateClientNutritionPlanDto: UpdateClientNutritionPlanDto,
  ): Promise<ClientNutritionPlanResponse> {
    const plan = await this.clientNutritionPlanService.update(
      id,
      updateClientNutritionPlanDto,
    );
    return toClientNutritionPlanResponse(plan);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: number): Promise<void> {
    await this.clientNutritionPlanService.remove(id);
  }
}
