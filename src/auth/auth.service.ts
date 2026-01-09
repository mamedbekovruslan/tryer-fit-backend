import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../users/client.entity';
import { Trainer } from '../users/trainer.entity';
import * as bcrypt from 'bcrypt';
import { LoginDto, AuthResponse } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(Trainer)
    private trainerRepository: Repository<Trainer>,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    // Try to find client first
    let user = await this.clientRepository.findOne({ where: { email } });
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (isPasswordValid) {
        const { password_hash, ...result } = user;
        return { ...result, user_type: 'client' };
      }
    }

    // If not found in clients, try trainers
    user = await this.trainerRepository.findOne({ where: { email } });
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (isPasswordValid) {
        const { password_hash, ...result } = user;
        return { ...result, user_type: 'trainer' };
      }
    }

    return null;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      user_type: user.user_type
    };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        user_type: user.user_type,
      },
    };
  }
}