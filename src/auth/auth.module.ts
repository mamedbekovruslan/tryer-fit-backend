import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TestAuthController } from './test-auth.controller';
import { ClientModule } from '../users/client.module';
import { TrainerModule } from '../users/trainer.module';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '../users/client.entity';
import { Trainer } from '../users/trainer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client, Trainer]),
    ClientModule,
    TrainerModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret_key',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ? parseInt(process.env.JWT_EXPIRES_IN, 10) || 3600 : 3600 },
    }),
  ],
  controllers: [AuthController, TestAuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}