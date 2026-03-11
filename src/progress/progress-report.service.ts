import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ProgressReport } from './progress-report.entity';
import { ProgressReportComment } from './progress-report-comment.entity';
import { Client } from '../users/client.entity';
import { ClientService } from '../users/client.service';
import { Trainer } from '../users/trainer.entity';

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
  private commentsTableExists: boolean | null = null;

  constructor(
    @InjectRepository(ProgressReport)
    private progressReportRepository: Repository<ProgressReport>,
    @InjectRepository(ProgressReportComment)
    private progressReportCommentRepository: Repository<ProgressReportComment>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(Trainer)
    private trainerRepository: Repository<Trainer>,
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
    const relations = await this.getProgressReportRelations();

    return await this.progressReportRepository.find({
      where: whereCondition,
      order: { date: 'DESC' }, // Сортируем по дате в порядке убывания
      relations,
    });
  }

  async findOne(id: number, clientId: number): Promise<ProgressReport | null> {
    const relations = await this.getProgressReportRelations();

    return await this.progressReportRepository.findOne({
      where: { id, client: { id: clientId } },
      relations,
    });
  }

  async findAllByTrainerClient(trainerId: number, clientId: number): Promise<ProgressReport[]> {
    await this.ensureTrainerOwnsClient(trainerId, clientId);
    const relations = await this.getProgressReportRelations();

    return await this.progressReportRepository.find({
      where: { client: { id: clientId } },
      relations,
      order: { date: 'DESC' },
    });
  }

  async findOneForTrainer(id: number, trainerId: number): Promise<ProgressReport | null> {
    const relations = await this.getProgressReportRelations(true);
    const report = await this.progressReportRepository.findOne({
      where: { id },
      relations,
    });

    if (!report) {
      return null;
    }

    if (report.client?.trainer?.id !== trainerId) {
      throw new BadRequestException('Progress report not found or client is not assigned to you');
    }

    return report;
  }

  async getComments(reportId: number, actor: { userType: 'client' | 'trainer'; userId: number }): Promise<ProgressReportComment[]> {
    if (!(await this.hasProgressReportCommentsTable())) {
      return [];
    }

    const report = await this.getAccessibleReport(reportId, actor);

    return await this.progressReportCommentRepository.find({
      where: { report: { id: report.id } },
      relations: ['trainer'],
      order: { createdAt: 'DESC' },
    });
  }

  async addComment(reportId: number, trainerId: number, commentText: string): Promise<ProgressReportComment> {
    if (!(await this.hasProgressReportCommentsTable())) {
      throw new BadRequestException(
        'Таблица комментариев к отчетам еще не создана. Запустите миграции backend.',
      );
    }

    const report = await this.findOneForTrainer(reportId, trainerId);
    if (!report) {
      throw new BadRequestException('Progress report not found');
    }

    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new BadRequestException('Trainer not found');
    }

    const comment = this.progressReportCommentRepository.create({
      comment: commentText.trim(),
      report,
      trainer,
    });

    return await this.progressReportCommentRepository.save(comment);
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

  private async ensureTrainerOwnsClient(trainerId: number, clientId: number): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id: clientId },
      relations: ['trainer'],
    });

    if (!client) {
      throw new BadRequestException('Client not found');
    }

    if (!client.trainer || client.trainer.id !== trainerId) {
      throw new BadRequestException('Client is not assigned to this trainer');
    }

    return client;
  }

  private async getAccessibleReport(
    reportId: number,
    actor: { userType: 'client' | 'trainer'; userId: number },
  ): Promise<ProgressReport> {
    const report = await this.progressReportRepository.findOne({
      where: { id: reportId },
      relations: ['client', 'client.trainer'],
    });

    if (!report) {
      throw new BadRequestException('Progress report not found');
    }

    if (actor.userType === 'client' && report.client.id !== actor.userId) {
      throw new BadRequestException('Access denied');
    }

    if (actor.userType === 'trainer' && report.client.trainer?.id !== actor.userId) {
      throw new BadRequestException('Access denied');
    }

    return report;
  }

  private async getProgressReportRelations(includeClientTrainer: boolean = false): Promise<string[]> {
    const relations = ['client'];

    if (includeClientTrainer) {
      relations.push('client.trainer');
    }

    if (await this.hasProgressReportCommentsTable()) {
      relations.push('comments', 'comments.trainer');
    }

    return relations;
  }

  private async hasProgressReportCommentsTable(): Promise<boolean> {
    if (this.commentsTableExists !== null) {
      return this.commentsTableExists;
    }

    const result = await this.progressReportRepository.query(
      `SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'progress_report_comments'
      ) AS exists`,
    );

    this.commentsTableExists = Boolean(result?.[0]?.exists);
    return this.commentsTableExists;
  }
}
