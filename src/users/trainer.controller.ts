import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ConflictException,
  BadRequestException,
  UseGuards,
  Request,
  Param,
  Put,
  Delete,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import { TrainerService } from './trainer.service';
import { ClientService } from './client.service';
import type { CreateTrainerDto } from './trainer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ClientResponse,
  TrainerResponse,
  toClientResponse,
  toTrainerResponse,
} from './user-response';
import { AccessControlService } from '../auth/access-control.service';
import type { AuthenticatedRequest } from '../auth/auth.types';

@Controller('trainers')
export class TrainerController {
  constructor(
    private readonly trainerService: TrainerService,
    private readonly clientService: ClientService,
    private readonly accessControlService: AccessControlService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Request() req: AuthenticatedRequest,
  ): Promise<TrainerResponse[]> {
    this.accessControlService.assertTrainer(
      req.user,
      'Only trainers can access trainers list',
    );

    const trainers = await this.trainerService.findAll();
    return trainers.map(toTrainerResponse);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() createTrainerDto: CreateTrainerDto,
  ): Promise<TrainerResponse> {
    // Check if trainer already exists
    const existingTrainer = await this.trainerService.findByEmail(
      createTrainerDto.email,
    );
    if (existingTrainer !== null) {
      throw new ConflictException('Trainer with this email already exists');
    }

    // Basic validation
    if (
      !createTrainerDto.email ||
      !createTrainerDto.password ||
      !createTrainerDto.username
    ) {
      throw new BadRequestException(
        'Email, password, and username are required',
      );
    }

    const trainer = await this.trainerService.create(createTrainerDto);
    return toTrainerResponse(trainer);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(
    @Request() req: AuthenticatedRequest,
  ): Promise<TrainerResponse> {
    this.accessControlService.assertTrainer(
      req.user,
      'Only trainers can access their profile',
    );

    const trainer = await this.trainerService.findById(req.user.sub);
    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }
    return toTrainerResponse(trainer);
  }

  // Получить клиентов, которые не привязаны ни к какому тренеру
  @Get('unassigned-clients')
  @UseGuards(JwtAuthGuard)
  async getUnassignedClients(
    @Request() req: AuthenticatedRequest,
  ): Promise<ClientResponse[]> {
    this.accessControlService.assertTrainer(
      req.user,
      'Only trainers can access unassigned clients',
    );

    const clients = await this.clientService.getUnassignedClients();
    return clients.map(toClientResponse);
  }

  // Получить клиентов, привязанных к тренеру
  @Get(':id/clients')
  @UseGuards(JwtAuthGuard)
  async getClients(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<ClientResponse[]> {
    const trainerId = parseInt(id, 10);

    // Проверяем, является ли id допустимым числом
    if (isNaN(trainerId)) {
      throw new BadRequestException('Invalid trainer ID');
    }

    this.accessControlService.assertOwnTrainer(
      req.user,
      trainerId,
      'Trainers can only access their own clients',
    );

    const clients = await this.trainerService.getClientsByTrainerId(trainerId);
    return clients.map(toClientResponse);
  }

  // Привязать клиента к тренеру
  @Put(':trainerId/assign-client/:clientId')
  @UseGuards(JwtAuthGuard)
  async assignClientToTrainer(
    @Request() req: AuthenticatedRequest,
    @Param('trainerId') trainerId: string,
    @Param('clientId') clientId: string,
  ): Promise<ClientResponse> {
    const tId = parseInt(trainerId, 10);
    const cId = parseInt(clientId, 10);

    // Проверяем, является ли id допустимыми числами
    if (isNaN(tId) || isNaN(cId)) {
      throw new BadRequestException('Invalid trainer or client ID');
    }

    this.accessControlService.assertOwnTrainer(
      req.user,
      tId,
      'Trainers can only assign clients to themselves',
    );

    const client = await this.trainerService.assignClientToTrainer(cId, tId);
    return toClientResponse(client);
  }

  // Отвязать клиента от тренера
  @Delete(':trainerId/unassign-client/:clientId')
  @UseGuards(JwtAuthGuard)
  async unassignClientFromTrainer(
    @Request() req: AuthenticatedRequest,
    @Param('trainerId') trainerId: string,
    @Param('clientId') clientId: string,
  ): Promise<ClientResponse> {
    const tId = parseInt(trainerId, 10);
    const cId = parseInt(clientId, 10);

    // Проверяем, является ли id допустимыми числами
    if (isNaN(tId) || isNaN(cId)) {
      throw new BadRequestException('Invalid trainer or client ID');
    }

    this.accessControlService.assertOwnTrainer(
      req.user,
      tId,
      'Trainers can only unassign clients from themselves',
    );

    const client = await this.trainerService.unassignClientFromTrainer(cId);
    return toClientResponse(client);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateData: Partial<CreateTrainerDto>,
  ): Promise<TrainerResponse> {
    const trainerId = parseInt(id, 10);

    // Проверяем, является ли id допустимым числом
    if (isNaN(trainerId)) {
      throw new BadRequestException('Invalid trainer ID');
    }

    this.accessControlService.assertOwnTrainer(
      req.user,
      trainerId,
      'Trainers can only update their own profile',
    );

    const trainer = await this.trainerService.updateTrainer(
      trainerId,
      updateData,
    );
    return toTrainerResponse(trainer);
  }

  // PATCH endpoint для обновления отдельных полей
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateField(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateData: Partial<CreateTrainerDto>,
  ): Promise<TrainerResponse> {
    const trainerId = parseInt(id, 10);

    // Проверяем, является ли id допустимым числом
    if (isNaN(trainerId)) {
      throw new BadRequestException('Invalid trainer ID');
    }

    this.accessControlService.assertOwnTrainer(
      req.user,
      trainerId,
      'Trainers can only update their own profile',
    );

    const trainer = await this.trainerService.updateTrainer(
      trainerId,
      updateData,
    );
    return toTrainerResponse(trainer);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Request() _req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<TrainerResponse> {
    const trainerId = parseInt(id, 10);

    // Проверяем, является ли id допустимым числом
    if (isNaN(trainerId)) {
      throw new BadRequestException('Invalid trainer ID');
    }

    const trainer = await this.trainerService.findById(trainerId);
    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }
    return toTrainerResponse(trainer);
  }
}
