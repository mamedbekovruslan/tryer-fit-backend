import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ProgressReport } from './progress-report.entity';
import { Client } from '../users/client.entity';
import { ClientService } from '../users/client.service';

export interface CreateProgressReportDto {
  date: Date;
  weight?: number;
  waist?: number;
  hips?: number;
  chest?: number;
  arms?: number;
  thighs?: number;
  bodyFat?: number;
  muscleMass?: number;
  notes?: string;
  photoUrls?: string[];
  clientId: number; // ID клиента, которому принадлежит отчет
}

export interface UpdateProgressReportDto {
  date?: Date;
  weight?: number;
  waist?: number;
  hips?: number;
  chest?: number;
  arms?: number;
  thighs?: number;
  bodyFat?: number;
  muscleMass?: number;
  notes?: string;
  photoUrls?: string[];
}

export interface CreateProgressReportDto {
  date: Date;
  weight?: number;
  waist?: number;
  hips?: number;
  chest?: number;
  arms?: number;
  thighs?: number;
  bodyFat?: number;
  muscleMass?: number;
  notes?: string;
  photoUrls?: string[];
  clientId: number; // ID клиента, которому принадлежит отчет
}

export interface UpdateProgressReportDto {
  date?: Date;
  weight?: number;
  waist?: number;
  hips?: number;
  chest?: number;
  arms?: number;
  thighs?: number;
  bodyFat?: number;
  muscleMass?: number;
  notes?: string;
  photoUrls?: string[];
}

export interface CreateProgressReportDto {
  date: Date;
  weight?: number;
  waist?: number;
  hips?: number;
  chest?: number;
  arms?: number;
  thighs?: number;
  bodyFat?: number;
  muscleMass?: number;
  notes?: string;
  photoUrls?: string[];
  clientId: number; // ID клиента, которому принадлежит отчет
}

export interface UpdateProgressReportDto {
  date?: Date;
  weight?: number;
  waist?: number;
  hips?: number;
  chest?: number;
  arms?: number;
  thighs?: number;
  bodyFat?: number;
  muscleMass?: number;
  notes?: string;
  photoUrls?: string[];
}

@Injectable()
export class ProgressReportService {
  constructor(
    @InjectRepository(ProgressReport)
    private progressReportRepository: Repository<ProgressReport>,
    private clientService: ClientService,
  ) {}

  async create(createProgressReportDto: CreateProgressReportDto): Promise<ProgressReport> {
    console.log('Creating progress report with DTO:', createProgressReportDto);

    // Находим клиента
    const client = await this.clientService.findById(createProgressReportDto.clientId);
    if (!client) {
      throw new BadRequestException('Client not found');
    }

    console.log('Found client:', client.id);

    // Создаем новый отчет о прогрессе
    const progressReport = new ProgressReport();
    progressReport.date = createProgressReportDto.date;
    progressReport.weight = createProgressReportDto.weight;
    progressReport.waist = createProgressReportDto.waist;
    progressReport.hips = createProgressReportDto.hips;
    progressReport.chest = createProgressReportDto.chest;
    progressReport.arms = createProgressReportDto.arms;
    progressReport.thighs = createProgressReportDto.thighs;
    progressReport.bodyFat = createProgressReportDto.bodyFat;
    progressReport.muscleMass = createProgressReportDto.muscleMass;
    progressReport.notes = createProgressReportDto.notes;
    progressReport.photoUrls = createProgressReportDto.photoUrls;
    progressReport.client = client;

    console.log('Progress report entity before saving:', progressReport);

    // Сохраняем отчет
    const savedReport = await this.progressReportRepository.save(progressReport);

    console.log('Saved report:', savedReport);

    // Обновляем соответствующие поля в профиле клиента
    await this.updateClientProfileWithProgressData(client.id, {
      weight: createProgressReportDto.weight,
      waist_circumference: createProgressReportDto.waist,
      hip_circumference: createProgressReportDto.hips,
      chest_circumference: createProgressReportDto.chest,
      arm_circumference: createProgressReportDto.arms,
      leg_circumference: createProgressReportDto.thighs,
      body_fat: createProgressReportDto.bodyFat,
      muscle_mass: createProgressReportDto.muscleMass,
    });

    return savedReport;
  }

  async findAllByClient(clientId: number): Promise<ProgressReport[]> {
    const whereCondition: FindOptionsWhere<ProgressReport> = { client: { id: clientId } };
    return await this.progressReportRepository.find({
      where: whereCondition,
      order: { date: 'DESC' }, // Сортируем по дате в порядке убывания
      relations: ['client'], // Включаем информацию о клиенте
    });
  }

  async findOne(id: number, clientId: number): Promise<ProgressReport | null> {
    return await this.progressReportRepository.findOne({
      where: { id, client: { id: clientId } },
      relations: ['client'], // Включаем информацию о клиенте
    });
  }

  async update(id: number, clientId: number, updateProgressReportDto: UpdateProgressReportDto): Promise<ProgressReport> {
    const report = await this.progressReportRepository.findOne({
      where: { id, client: { id: clientId } },
      relations: ['client'], // Включаем информацию о клиенте
    });

    if (!report) {
      throw new BadRequestException('Progress report not found or does not belong to the client');
    }

    // Обновляем поля отчета
    Object.assign(report, updateProgressReportDto);

    // Сохраняем обновленный отчет
    const updatedReport = await this.progressReportRepository.save(report);

    // Обновляем соответствующие поля в профиле клиента
    await this.updateClientProfileWithProgressData(clientId, {
      weight: updateProgressReportDto.weight,
      waist_circumference: updateProgressReportDto.waist,
      hip_circumference: updateProgressReportDto.hips,
      chest_circumference: updateProgressReportDto.chest,
      arm_circumference: updateProgressReportDto.arms,
      leg_circumference: updateProgressReportDto.thighs,
      body_fat: updateProgressReportDto.bodyFat,
      muscle_mass: updateProgressReportDto.muscleMass,
    });

    return updatedReport;
  }

  async remove(id: number, clientId: number): Promise<void> {
    const report = await this.progressReportRepository.findOne({
      where: { id, client: { id: clientId } },
    });

    if (!report) {
      throw new BadRequestException('Progress report not found or does not belong to the client');
    }

    await this.progressReportRepository.remove(report);
  }

  private async updateClientProfileWithProgressData(clientId: number, progressData: {
    weight?: number;
    waist_circumference?: number;
    hip_circumference?: number;
    chest_circumference?: number;
    arm_circumference?: number;
    leg_circumference?: number;
    body_fat?: number;
    muscle_mass?: number;
  }) {
    // Обновляем только те поля, которые предоставлены
    const updateData: Partial<Client> = {};

    if (progressData.weight !== undefined) {
      updateData.weight = progressData.weight;
    }
    if (progressData.waist_circumference !== undefined) {
      updateData.waist_circumference = progressData.waist_circumference;
    }
    if (progressData.hip_circumference !== undefined) {
      updateData.hip_circumference = progressData.hip_circumference;
    }
    if (progressData.chest_circumference !== undefined) {
      updateData.chest_circumference = progressData.chest_circumference;
    }
    if (progressData.arm_circumference !== undefined) {
      updateData.arm_circumference = progressData.arm_circumference;
    }
    if (progressData.leg_circumference !== undefined) {
      updateData.leg_circumference = progressData.leg_circumference;
    }
    if (progressData.body_fat !== undefined) {
      updateData.body_fat = progressData.body_fat;
    }
    if (progressData.muscle_mass !== undefined) {
      updateData.muscle_mass = progressData.muscle_mass;
    }

    // Если есть данные для обновления, обновляем профиль клиента
    if (Object.keys(updateData).length > 0) {
      await this.clientService.update(clientId, updateData);
    }
  }
}