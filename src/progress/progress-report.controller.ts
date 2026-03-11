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
  BadRequestException,
} from '@nestjs/common';
import { ProgressReportService } from './progress-report.service';
import type { CreateProgressReportDto, UpdateProgressReportDto } from './progress-report.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProgressReport } from './progress-report.entity';
import { ProgressReportComment } from './progress-report-comment.entity';
import { CreateProgressReportCommentDto } from './dto/create-progress-report-comment.dto';

@Controller('progress-reports')
export class ProgressReportController {
  constructor(private readonly progressReportService: ProgressReportService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createProgressReportDto: CreateProgressReportDto): Promise<ProgressReport> {
    console.log('Creating progress report with data:', createProgressReportDto);
    console.log('Request user:', req.user);

    // Проверяем, что пользователь является клиентом
    if (req.user.user_type !== 'client') {
      throw new BadRequestException('Only clients can create progress reports');
    }

    // Устанавливаем ID клиента из токена, если не предоставлен в запросе
    if (!createProgressReportDto.clientId) {
      createProgressReportDto.clientId = req.user.sub;
      console.log('Set clientId from token:', req.user.sub);
    } else if (createProgressReportDto.clientId !== req.user.sub) {
      // Убедимся, что клиент не пытается создать отчет для другого клиента
      throw new BadRequestException('You can only create progress reports for yourself');
    }

    // Преобразуем дату, если она передана в виде строки
    if (typeof createProgressReportDto.date === 'string') {
      createProgressReportDto.date = new Date(createProgressReportDto.date);
    }

    console.log('Final data to create:', createProgressReportDto);
    return await this.progressReportService.create(createProgressReportDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req): Promise<ProgressReport[]> {
    // Клиенты могут получать только свои отчеты
    if (req.user.user_type === 'client') {
      return await this.progressReportService.findAllByClient(req.user.sub);
    }
    
    // Тренеры могут получать отчеты своих клиентов (реализация для будущего использования)
    // throw new BadRequestException('Trainers cannot access progress reports yet');
    return [];
  }

  @Get('client/:clientId')
  @UseGuards(JwtAuthGuard)
  async findAllByTrainerForClient(
    @Request() req,
    @Param('clientId') clientId: string,
  ): Promise<ProgressReport[]> {
    if (req.user.user_type !== 'trainer') {
      throw new BadRequestException('Only trainers can access client progress reports');
    }

    return await this.progressReportService.findAllByTrainerClient(
      req.user.sub,
      parseInt(clientId, 10),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Request() req, @Param('id') id: string): Promise<ProgressReport> {
    const reportId = parseInt(id, 10);
    
    // Клиенты могут получать только свои отчеты
    if (req.user.user_type === 'client') {
      const report = await this.progressReportService.findOne(reportId, req.user.sub);
      if (!report) {
        throw new BadRequestException('Progress report not found or does not belong to you');
      }
      return report;
    }
    
    // Тренеры могут получать отчеты своих клиентов (реализация для будущего использования)
    if (req.user.user_type === 'trainer') {
      const report = await this.progressReportService.findOneForTrainer(reportId, req.user.sub);
      if (!report) {
        throw new BadRequestException('Progress report not found');
      }
      return report;
    }

    throw new BadRequestException('Access denied');
  }

  @Get(':id/comments')
  @UseGuards(JwtAuthGuard)
  async getComments(@Request() req, @Param('id') id: string): Promise<ProgressReportComment[]> {
    return await this.progressReportService.getComments(parseInt(id, 10), {
      userType: req.user.user_type,
      userId: req.user.sub,
    });
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  async addComment(
    @Request() req,
    @Param('id') id: string,
    @Body() createCommentDto: CreateProgressReportCommentDto,
  ): Promise<ProgressReportComment> {
    if (req.user.user_type !== 'trainer') {
      throw new BadRequestException('Only trainers can add comments');
    }

    return await this.progressReportService.addComment(
      parseInt(id, 10),
      req.user.sub,
      createCommentDto.comment,
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req, 
    @Param('id') id: string, 
    @Body() updateProgressReportDto: UpdateProgressReportDto
  ): Promise<ProgressReport> {
    const reportId = parseInt(id, 10);
    
    // Клиенты могут обновлять только свои отчеты
    if (req.user.user_type === 'client') {
      return await this.progressReportService.update(reportId, req.user.sub, updateProgressReportDto);
    }
    
    throw new BadRequestException('Access denied');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Request() req, @Param('id') id: string): Promise<void> {
    const reportId = parseInt(id, 10);
    
    // Клиенты могут удалять только свои отчеты
    if (req.user.user_type === 'client') {
      await this.progressReportService.remove(reportId, req.user.sub);
    } else {
      throw new BadRequestException('Access denied');
    }
  }
}
