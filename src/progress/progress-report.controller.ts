import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ProgressReportService } from './progress-report.service';
import type {
  CreateProgressReportDto,
  UpdateProgressReportDto,
} from './progress-report.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProgressReportCommentDto } from './dto/create-progress-report-comment.dto';
import {
  ProgressReportCommentResponse,
  ProgressReportResponse,
  toProgressReportCommentResponse,
  toProgressReportResponse,
} from './progress-response';
import { AccessControlService } from '../auth/access-control.service';
import type { AuthenticatedRequest } from '../auth/auth.types';

@Controller('progress-reports')
export class ProgressReportController {
  constructor(
    private readonly progressReportService: ProgressReportService,
    private readonly accessControlService: AccessControlService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createProgressReportDto: CreateProgressReportDto,
  ): Promise<ProgressReportResponse> {
    this.accessControlService.assertClient(
      req.user,
      'Only clients can create progress reports',
    );

    // Устанавливаем ID клиента из токена, если не предоставлен в запросе
    if (!createProgressReportDto.clientId) {
      createProgressReportDto.clientId = req.user.sub;
    } else {
      this.accessControlService.assertOwnClient(
        req.user,
        createProgressReportDto.clientId,
        'You can only create progress reports for yourself',
      );
    }

    // Преобразуем дату, если она передана в виде строки
    if (typeof createProgressReportDto.date === 'string') {
      createProgressReportDto.date = new Date(createProgressReportDto.date);
    }

    const report = await this.progressReportService.create(
      createProgressReportDto,
    );
    return toProgressReportResponse(report);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Request() req: AuthenticatedRequest,
  ): Promise<ProgressReportResponse[]> {
    // Клиенты могут получать только свои отчеты
    if (req.user.user_type === 'client') {
      const reports = await this.progressReportService.findAllByClient(
        req.user.sub,
      );
      return reports.map(toProgressReportResponse);
    }

    // Тренеры могут получать отчеты своих клиентов (реализация для будущего использования)
    // throw new BadRequestException('Trainers cannot access progress reports yet');
    return [];
  }

  @Get('client/:clientId')
  @UseGuards(JwtAuthGuard)
  async findAllByTrainerForClient(
    @Request() req: AuthenticatedRequest,
    @Param('clientId') clientId: string,
  ): Promise<ProgressReportResponse[]> {
    this.accessControlService.assertTrainer(
      req.user,
      'Only trainers can access client progress reports',
    );

    const reports = await this.progressReportService.findAllByTrainerClient(
      req.user.sub,
      parseInt(clientId, 10),
    );
    return reports.map(toProgressReportResponse);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<ProgressReportResponse> {
    const reportId = parseInt(id, 10);

    // Клиенты могут получать только свои отчеты
    if (req.user.user_type === 'client') {
      const report = await this.progressReportService.findOne(
        reportId,
        req.user.sub,
      );
      if (!report) {
        throw new NotFoundException('Progress report not found');
      }
      return toProgressReportResponse(report);
    }

    // Тренеры могут получать отчеты своих клиентов (реализация для будущего использования)
    if (req.user.user_type === 'trainer') {
      const report = await this.progressReportService.findOneForTrainer(
        reportId,
        req.user.sub,
      );
      if (!report) {
        throw new NotFoundException('Progress report not found');
      }
      return toProgressReportResponse(report);
    }

    throw new ForbiddenException('Access denied');
  }

  @Get(':id/comments')
  @UseGuards(JwtAuthGuard)
  async getComments(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<ProgressReportCommentResponse[]> {
    const comments = await this.progressReportService.getComments(
      parseInt(id, 10),
      {
        userType: req.user.user_type,
        userId: req.user.sub,
      },
    );
    return comments.map(toProgressReportCommentResponse);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  async addComment(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() createCommentDto: CreateProgressReportCommentDto,
  ): Promise<ProgressReportCommentResponse> {
    this.accessControlService.assertTrainer(
      req.user,
      'Only trainers can add comments',
    );

    const comment = await this.progressReportService.addComment(
      parseInt(id, 10),
      req.user.sub,
      createCommentDto.comment,
    );
    return toProgressReportCommentResponse(comment);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateProgressReportDto: UpdateProgressReportDto,
  ): Promise<ProgressReportResponse> {
    const reportId = parseInt(id, 10);

    // Клиенты могут обновлять только свои отчеты
    if (req.user.user_type === 'client') {
      const report = await this.progressReportService.update(
        reportId,
        req.user.sub,
        updateProgressReportDto,
      );
      return toProgressReportResponse(report);
    }

    throw new ForbiddenException('Access denied');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<void> {
    const reportId = parseInt(id, 10);

    // Клиенты могут удалять только свои отчеты
    if (req.user.user_type === 'client') {
      await this.progressReportService.remove(reportId, req.user.sub);
    } else {
      throw new ForbiddenException('Access denied');
    }
  }
}
