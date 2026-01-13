import { Controller, Get, Post, Body, HttpCode, HttpStatus, ConflictException, BadRequestException, UseGuards, Request, Param } from '@nestjs/common';
import { TrainerService } from './trainer.service';
import type { CreateTrainerDto } from './trainer.service';
import { Trainer } from './trainer.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('trainers')
export class TrainerController {
  constructor(private readonly trainerService: TrainerService) {}

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

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Request() req, @Param('id') id: string): Promise<Trainer> {
    const trainerId = parseInt(id, 10);
    const trainer = await this.trainerService.findById(trainerId);
    if (!trainer) {
      throw new BadRequestException('Trainer not found');
    }
    return trainer;
  }
}