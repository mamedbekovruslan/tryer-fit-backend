import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client, FitnessGoal } from './client.entity';
import * as bcrypt from 'bcrypt';

export interface CreateClientDto {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  // Данные для профиля
  waist_circumference?: number;
  chest_circumference?: number;
  hip_circumference?: number;
  arm_circumference?: number;
  leg_circumference?: number;
  fitness_goal?: FitnessGoal;
  expected_result?: string;
  contraindications?: string;
  diseases?: string;
  limitations?: string;
  training_experience?: string;
  current_diet?: string;
  photo_urls?: string[];
}

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async findAll(): Promise<Client[]> {
    return await this.clientRepository.find();
  }

  async create(clientData: CreateClientDto): Promise<Client> {
    // Basic validation
    if (!clientData.email || !clientData.password || !clientData.username) {
      throw new BadRequestException('Email, password, and username are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientData.email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Validate password strength (at least 6 characters)
    if (clientData.password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long');
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(clientData.password, saltRounds);

    const client = new Client();
    client.username = clientData.username;
    client.email = clientData.email;
    client.password_hash = hashedPassword;
    client.first_name = clientData.first_name;
    client.last_name = clientData.last_name;

    // Добавляем поля профиля
    client.waist_circumference = clientData.waist_circumference;
    client.chest_circumference = clientData.chest_circumference;
    client.hip_circumference = clientData.hip_circumference;
    client.arm_circumference = clientData.arm_circumference;
    client.leg_circumference = clientData.leg_circumference;
    client.fitness_goal = clientData.fitness_goal;
    client.expected_result = clientData.expected_result;
    client.contraindications = clientData.contraindications;
    client.diseases = clientData.diseases;
    client.limitations = clientData.limitations;
    client.training_experience = clientData.training_experience;
    client.current_diet = clientData.current_diet;
    client.photo_urls = clientData.photo_urls;

    return await this.clientRepository.save(client);
  }

  async findByEmail(email: string): Promise<Client | null> {
    return await this.clientRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<Client | null> {
    return await this.clientRepository.findOne({ where: { id } });
  }
}