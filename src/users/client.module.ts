import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './client.entity';
import { Trainer } from './trainer.entity';
import { ClientService } from './client.service';
import { TrainerService } from './trainer.service';
import { ClientController } from './client.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Client, Trainer])],
  controllers: [ClientController],
  providers: [ClientService, TrainerService],
  exports: [ClientService],
})
export class ClientModule {}