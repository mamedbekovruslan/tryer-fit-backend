import { Controller, Get, Post, Body, HttpCode, HttpStatus, ConflictException, BadRequestException } from '@nestjs/common';
import { TrainerService } from './trainer.service';
import type { CreateTrainerDto } from './trainer.service';
import { Trainer } from './trainer.entity';

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
}