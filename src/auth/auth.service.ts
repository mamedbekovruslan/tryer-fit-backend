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
    console.log('Validating user with email:', email); // Логируем email пользователя

    // Try to find client first
    let user = await this.clientRepository.findOne({ where: { email } });
    console.log('Found client:', user); // Логируем найденного клиента

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      console.log('Password validation result:', isPasswordValid); // Логируем результат проверки пароля
      if (isPasswordValid) {
        const { password_hash, ...result } = user;
        console.log('Returning client result:', { ...result, user_type: 'client' }); // Логируем результат
        return { ...result, user_type: 'client' };
      }
    }

    // If not found in clients, try trainers
    user = await this.trainerRepository.findOne({ where: { email } });
    console.log('Found trainer:', user); // Логируем найденного тренера

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      console.log('Password validation result for trainer:', isPasswordValid); // Логируем результат проверки пароля для тренера
      if (isPasswordValid) {
        const { password_hash, ...result } = user;
        console.log('Returning trainer result:', { ...result, user_type: 'trainer' }); // Логируем результат для тренера
        return { ...result, user_type: 'trainer' };
      }
    }

    console.log('User not found or invalid password'); // Логируем, если пользователь не найден
    return null;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('Logging in user:', user); // Логируем информацию о пользователе

    // Если пользователь - клиент, получаем информацию о его тренере
    let trainerInfo: any = undefined;
    if (user.user_type === 'client') {
      const clientWithTrainer = await this.clientRepository.findOne({
        where: { id: user.id },
        relations: ['trainer']
      });
      trainerInfo = clientWithTrainer?.trainer;
      console.log('Trainer info for client:', trainerInfo); // Логируем информацию о тренере
    }

    const payload = {
      email: user.email,
      sub: user.id,
      user_type: user.user_type
    };
    const access_token = this.jwtService.sign(payload);

    console.log('Generated payload:', payload); // Логируем сгенерированный payload

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
}