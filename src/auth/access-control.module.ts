import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessControlService } from './access-control.service';
import { Client } from '../users/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client])],
  providers: [AccessControlService],
  exports: [AccessControlService],
})
export class AccessControlModule {}
