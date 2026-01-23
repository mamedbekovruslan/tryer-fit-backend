import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressReport } from './progress-report.entity';
import { ProgressReportController } from './progress-report.controller';
import { ProgressReportService } from './progress-report.service';
import { ClientModule } from '../users/client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProgressReport]),
    ClientModule, // Импортируем ClientModule для доступа к ClientService
  ],
  controllers: [ProgressReportController],
  providers: [ProgressReportService],
  exports: [ProgressReportService], // Экспортируем сервис, если он понадобится в других модулях
})
export class ProgressReportModule {}