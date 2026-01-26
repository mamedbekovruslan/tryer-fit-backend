import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trainer } from './trainer.entity';
import { Client } from './client.entity';
import { TrainerService } from './trainer.service';
import { TrainerController } from './trainer.controller';
import { ClientService } from './client.service';

@Module({
  imports: [TypeOrmModule.forFeature([Trainer, Client])],
  controllers: [TrainerController],
  providers: [TrainerService, ClientService],
  exports: [TrainerService],
})
export class TrainerModule {}