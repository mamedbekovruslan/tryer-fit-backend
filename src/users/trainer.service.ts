import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trainer } from './trainer.entity';
import * as bcrypt from 'bcrypt';

export interface CreateTrainerDto {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  gender?: string;
  height?: number;
  weight?: number;
  phone?: string;
  birth_date?: Date;
  // Данные профиля тренера
  education?: string;
  institution?: string;
  degree?: string;
  specialization?: string;
  certificate_number?: string;
  photo_urls?: string[];
}

@Injectable()
export class TrainerService {
  constructor(
    @InjectRepository(Trainer)
    private trainerRepository: Repository<Trainer>,
  ) {}

  async findAll(): Promise<Trainer[]> {
    return await this.trainerRepository.find();
  }

  async create(trainerData: CreateTrainerDto): Promise<Trainer> {
    // Basic validation
    if (!trainerData.email || !trainerData.password || !trainerData.username) {
      throw new BadRequestException('Email, password, and username are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trainerData.email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Validate password strength (at least 6 characters)
    if (trainerData.password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long');
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(trainerData.password, saltRounds);

    const trainer = new Trainer();
    trainer.username = trainerData.username;
    trainer.email = trainerData.email;
    trainer.password_hash = hashedPassword;
    trainer.first_name = trainerData.first_name;
    trainer.last_name = trainerData.last_name;
    trainer.middle_name = trainerData.middle_name;
    trainer.gender = trainerData.gender;
    trainer.height = trainerData.height;
    trainer.weight = trainerData.weight;
    trainer.phone = trainerData.phone;
    trainer.birth_date = trainerData.birth_date;

    // Добавляем поля профиля тренера
    trainer.education = trainerData.education;
    trainer.institution = trainerData.institution;
    trainer.degree = trainerData.degree;
    trainer.specialization = trainerData.specialization;
    trainer.certificate_number = trainerData.certificate_number;
    trainer.photo_urls = trainerData.photo_urls;

    return await this.trainerRepository.save(trainer);
  }

  async findByEmail(email: string): Promise<Trainer | null> {
    return await this.trainerRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<Trainer | null> {
    return await this.trainerRepository.findOne({ where: { id } });
  }
}