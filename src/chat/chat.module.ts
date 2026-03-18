import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatMessage } from './chat-message.entity';
import { Client } from '../users/client.entity';
import { Trainer } from '../users/trainer.entity';
import { JwtModule } from '@nestjs/jwt';
import { AccessControlModule } from '../auth/access-control.module';
import { getJwtExpiresIn, getJwtSecret } from '../config/security-config';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage, Client, Trainer]),
    AccessControlModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: getJwtSecret(),
        signOptions: {
          expiresIn: getJwtExpiresIn(),
        },
      }),
    }),
  ],
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
