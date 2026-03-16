import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressReport } from './progress-report.entity';
import { ProgressReportComment } from './progress-report-comment.entity';
import { ProgressReportController } from './progress-report.controller';
import { ProgressReportService } from './progress-report.service';
import { ClientModule } from '../users/client.module';
import { TrainerModule } from '../users/trainer.module';
import { Trainer } from '../users/trainer.entity';
import { Client } from '../users/client.entity';
import { AccessControlModule } from '../auth/access-control.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProgressReport,
      ProgressReportComment,
      Trainer,
      Client,
    ]),
    AccessControlModule,
    ClientModule, // Импортируем ClientModule для доступа к ClientService
    TrainerModule,
  ],
  controllers: [ProgressReportController],
  providers: [ProgressReportService],
  exports: [ProgressReportService], // Экспортируем сервис, если он понадобится в других модулях
})
export class ProgressReportModule {}
