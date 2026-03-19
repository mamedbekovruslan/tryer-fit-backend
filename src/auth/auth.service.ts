import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../users/client.entity';
import { Trainer } from '../users/trainer.entity';
import * as bcrypt from 'bcrypt';
import { LoginDto, AuthResponse } from './auth.dto';
import type { Response } from 'express';
import type { UserType } from './auth.types';
import { toTrainerResponse } from '../users/user-response';
import type { CookieOptions } from 'express';

type AuthenticatedEntity = Client | Trainer;

type ValidatedUser = Omit<AuthenticatedEntity, 'password_hash'> & {
  user_type: UserType;
};

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(Trainer)
    private trainerRepository: Repository<Trainer>,
  ) {}

  private async validateEntityPassword<T extends AuthenticatedEntity>(
    user: T | null,
    password: string,
    userType: UserType,
  ): Promise<ValidatedUser | null> {
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return null;
    }

    const result = { ...user } as Omit<AuthenticatedEntity, 'password_hash'>;
    delete (result as Partial<AuthenticatedEntity>).password_hash;
    return { ...result, user_type: userType };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<ValidatedUser | null> {
    const client = await this.clientRepository.findOne({ where: { email } });
    const validatedClient = await this.validateEntityPassword(
      client,
      password,
      'client',
    );
    if (validatedClient) {
      return validatedClient;
    }

    const trainer = await this.trainerRepository.findOne({ where: { email } });
    return this.validateEntityPassword(trainer, password, 'trainer');
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    let trainerInfo: AuthResponse['user']['trainer'];
    if (user.user_type === 'client') {
      const clientWithTrainer = await this.clientRepository.findOne({
        where: { id: user.id },
        relations: ['trainer'],
      });
      trainerInfo = clientWithTrainer?.trainer
        ? toTrainerResponse(clientWithTrainer.trainer)
        : undefined;
    }

    const payload = {
      email: user.email,
      sub: user.id,
      user_type: user.user_type,
    };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        user_type: user.user_type,
        trainer: trainerInfo,
      },
    };
  }

  setAuthCookie(response: Response, accessToken: string): void {
    const maxAgeSeconds = process.env.JWT_EXPIRES_IN
      ? parseInt(process.env.JWT_EXPIRES_IN, 10) || 3600
      : 3600;

    response.cookie('token', accessToken, {
      ...getAuthCookieOptions(),
      maxAge: maxAgeSeconds * 1000,
    });
  }

  clearAuthCookie(response: Response): void {
    response.clearCookie('token', getAuthCookieOptions());
  }
}

function getAuthCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    path: '/',
  };
}
