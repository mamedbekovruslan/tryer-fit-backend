import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client, FitnessGoal } from './client.entity';
import { TrainerService } from './trainer.service';
import * as bcrypt from 'bcrypt';

export interface CreateClientDto {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  trainer_id?: number;
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
  // Поля для хранения текущих данных прогресса
  weight?: number;
  body_fat?: number;
  muscle_mass?: number;
}

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    private trainerService: TrainerService,
  ) {}

  async findAll(): Promise<Client[]> {
    return await this.clientRepository.find({
      relations: ['trainer'],
    });
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

    // Handle trainer assignment if provided
    if (clientData.trainer_id) {
      const trainer = await this.trainerService.findById(clientData.trainer_id);
      if (!trainer) {
        throw new BadRequestException('Trainer not found');
      }
      client.trainer = trainer;
    }

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
    // Добавляем поля прогресса
    client.weight = clientData.weight;
    client.body_fat = clientData.body_fat;
    client.muscle_mass = clientData.muscle_mass;

    return await this.clientRepository.save(client);
  }

  async findByEmail(email: string): Promise<Client | null> {
    return await this.clientRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<Client | null> {
    console.log('Searching for client with ID:', id); // Логируем ID, который ищем
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['trainer']
    });
    console.log('Found client:', client); // Логируем найденного клиента
    return client;
  }

  async update(id: number, partialClient: Partial<Client>): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (!client) {
      throw new BadRequestException('Client not found');
    }

    // Обновляем только те поля, которые предоставлены
    Object.assign(client, partialClient);

    return await this.clientRepository.save(client);
  }
}