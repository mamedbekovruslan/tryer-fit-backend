import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { Trainer } from './trainer.entity';
import { Client } from './client.entity';
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
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
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

  // Получить клиентов, привязанных к тренеру
  async getClientsByTrainerId(trainerId: number): Promise<Client[]> {
    return await this.clientRepository.find({
      where: { trainer: { id: trainerId } },
      relations: ['trainer']
    });
  }

  // Привязать клиента к тренеру
  async assignClientToTrainer(clientId: number, trainerId: number): Promise<Client> {
    // Находим клиента и тренера
    const client = await this.clientRepository.findOne({ where: { id: clientId }, relations: ['trainer'] });
    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });

    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    // Привязываем клиента к тренеру
    client.trainer = trainer;
    const updatedClient = await this.clientRepository.save(client);

    // Возвращаем обновленного клиента с полной информацией о тренере
    const result = await this.clientRepository.findOne({ where: { id: updatedClient.id }, relations: ['trainer'] });
    if (!result) {
      throw new NotFoundException(`Updated client with ID ${updatedClient.id} not found`);
    }
    return result;
  }

  // Отвязать клиента от тренера
  async unassignClientFromTrainer(clientId: number): Promise<Client> {
    // Используем QueryBuilder для обновления связи
    await this.clientRepository
      .createQueryBuilder()
      .update()
      .set({ trainer: () => 'NULL' })
      .where('id = :id', { id: clientId })
      .execute();

    // Возвращаем обновленного клиента
    const result = await this.clientRepository.findOne({ where: { id: clientId }, relations: ['trainer'] });
    if (!result) {
      throw new NotFoundException(`Client with ID ${clientId} not found after unassignment`);
    }
    return result;
  }

  // Обновить информацию о тренере
  async updateTrainer(id: number, updateData: Partial<CreateTrainerDto>): Promise<Trainer> {
    const trainer = await this.trainerRepository.findOne({ where: { id } });

    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${id} not found`);
    }

    // Обновляем только те поля, которые предоставлены в updateData
    Object.assign(trainer, updateData);

    // Если предоставлен новый пароль, хешируем его
    if (updateData.password) {
      const saltRounds = 10;
      trainer.password_hash = await bcrypt.hash(updateData.password, saltRounds);
    }

    return await this.trainerRepository.save(trainer);
  }
}