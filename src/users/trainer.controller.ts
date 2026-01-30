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
} from '@nestjs/common';
import { TrainerService } from './trainer.service';
import { ClientService } from './client.service';
import type { CreateTrainerDto } from './trainer.service';
import { Trainer } from './trainer.entity';
import { Client } from './client.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('trainers')
export class TrainerController {
  constructor(
    private readonly trainerService: TrainerService,
    private readonly clientService: ClientService,
  ) {}

  @Get()
  async findAll(): Promise<Trainer[]> {
    return await this.trainerService.findAll();
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createTrainerDto: CreateTrainerDto): Promise<Trainer> {
    // Check if trainer already exists
    const existingTrainer = await this.trainerService.findByEmail(createTrainerDto.email);
    if (existingTrainer !== null) {
      throw new ConflictException('Trainer with this email already exists');
    }

    // Basic validation
    if (!createTrainerDto.email || !createTrainerDto.password || !createTrainerDto.username) {
      throw new BadRequestException('Email, password, and username are required');
    }

    return await this.trainerService.create(createTrainerDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req): Promise<Trainer> {
    console.log('Requesting profile for user:', req.user); // Логируем информацию о пользователе

    // Убедимся, что пользователь является тренером
    if (req.user.user_type !== 'trainer') {
      throw new BadRequestException('Only trainers can access their profile');
    }

    const trainer = await this.trainerService.findById(req.user.sub);
    if (!trainer) {
      throw new BadRequestException('Trainer not found');
    }
    console.log('Returning trainer:', trainer); // Логируем возвращаемого тренера
    return trainer;
  }

  // Получить клиентов, которые не привязаны ни к какому тренеру
  @Get('unassigned-clients')
  @UseGuards(JwtAuthGuard)
  async getUnassignedClients(@Request() req): Promise<Client[]> {
    // Проверяем, что пользователь - тренер
    if (req.user.user_type !== 'trainer') {
      throw new BadRequestException('Only trainers can access unassigned clients');
    }

    return await this.clientService.getUnassignedClients();
  }

  // Получить клиентов, привязанных к тренеру
  @Get(':id/clients')
  @UseGuards(JwtAuthGuard)
  async getClients(@Request() req, @Param('id') id: string): Promise<Client[]> {
    const trainerId = parseInt(id, 10);

    // Проверяем, является ли id допустимым числом
    if (isNaN(trainerId)) {
      throw new BadRequestException('Invalid trainer ID');
    }

    // Проверяем, что пользователь - тренер и запрашивает своих клиентов
    if (req.user.user_type !== 'trainer' || req.user.sub !== trainerId) {
      throw new BadRequestException('Trainers can only access their own clients');
    }

    return await this.trainerService.getClientsByTrainerId(trainerId);
  }

  // Привязать клиента к тренеру
  @Put(':trainerId/assign-client/:clientId')
  @UseGuards(JwtAuthGuard)
  async assignClientToTrainer(
    @Request() req,
    @Param('trainerId') trainerId: string,
    @Param('clientId') clientId: string
  ): Promise<Client> {
    const tId = parseInt(trainerId, 10);
    const cId = parseInt(clientId, 10);

    // Проверяем, является ли id допустимыми числами
    if (isNaN(tId) || isNaN(cId)) {
      throw new BadRequestException('Invalid trainer or client ID');
    }

    // Проверяем, что пользователь - тренер и действует от своего имени
    if (req.user.user_type !== 'trainer' || req.user.sub !== tId) {
      throw new BadRequestException('Trainers can only assign clients to themselves');
    }

    return await this.trainerService.assignClientToTrainer(cId, tId);
  }

  // Отвязать клиента от тренера
  @Delete(':trainerId/unassign-client/:clientId')
  @UseGuards(JwtAuthGuard)
  async unassignClientFromTrainer(
    @Request() req,
    @Param('trainerId') trainerId: string,
    @Param('clientId') clientId: string
  ): Promise<Client> {
    const tId = parseInt(trainerId, 10);
    const cId = parseInt(clientId, 10);

    // Проверяем, является ли id допустимыми числами
    if (isNaN(tId) || isNaN(cId)) {
      throw new BadRequestException('Invalid trainer or client ID');
    }

    // Проверяем, что пользователь - тренер и действует от своего имени
    if (req.user.user_type !== 'trainer' || req.user.sub !== tId) {
      throw new BadRequestException('Trainers can only unassign clients from themselves');
    }

    return await this.trainerService.unassignClientFromTrainer(cId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateData: Partial<CreateTrainerDto>
  ): Promise<Trainer> {
    const trainerId = parseInt(id, 10);

    // Проверяем, является ли id допустимым числом
    if (isNaN(trainerId)) {
      throw new BadRequestException('Invalid trainer ID');
    }

    // Проверяем, что пользователь - тренер и обновляет свой профиль
    if (req.user.user_type !== 'trainer' || req.user.sub !== trainerId) {
      throw new BadRequestException('Trainers can only update their own profile');
    }

    return await this.trainerService.updateTrainer(trainerId, updateData);
  }

  // PATCH endpoint для обновления отдельных полей
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateField(
    @Request() req,
    @Param('id') id: string,
    @Body() updateData: Partial<CreateTrainerDto>
  ): Promise<Trainer> {
    const trainerId = parseInt(id, 10);

    // Проверяем, является ли id допустимым числом
    if (isNaN(trainerId)) {
      throw new BadRequestException('Invalid trainer ID');
    }

    // Проверяем, что пользователь - тренер и обновляет свой профиль
    if (req.user.user_type !== 'trainer' || req.user.sub !== trainerId) {
      throw new BadRequestException('Trainers can only update their own profile');
    }

    return await this.trainerService.updateTrainer(trainerId, updateData);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Request() req, @Param('id') id: string): Promise<Trainer> {
    const trainerId = parseInt(id, 10);

    // Проверяем, является ли id допустимым числом
    if (isNaN(trainerId)) {
      throw new BadRequestException('Invalid trainer ID');
    }

    const trainer = await this.trainerService.findById(trainerId);
    if (!trainer) {
      throw new BadRequestException('Trainer not found');
    }
    return trainer;
  }
}