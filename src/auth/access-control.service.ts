import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../users/client.entity';
import type { AuthUser } from './auth.types';

@Injectable()
export class AccessControlService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  assertClient(
    user: AuthUser,
    message: string = 'Only clients can access this resource',
  ): void {
    if (user.user_type !== 'client') {
      throw new ForbiddenException(message);
    }
  }

  assertTrainer(
    user: AuthUser,
    message: string = 'Only trainers can access this resource',
  ): void {
    if (user.user_type !== 'trainer') {
      throw new ForbiddenException(message);
    }
  }

  assertOwnClient(
    user: AuthUser,
    clientId: number,
    message: string = 'Clients can only access their own data',
  ): void {
    this.assertClient(user, message);

    if (user.sub !== clientId) {
      throw new ForbiddenException(message);
    }
  }

  assertOwnTrainer(
    user: AuthUser,
    trainerId: number,
    message: string = 'Trainers can only access their own data',
  ): void {
    this.assertTrainer(user, message);

    if (user.sub !== trainerId) {
      throw new ForbiddenException(message);
    }
  }

  async assertTrainerOwnsClient(
    trainerId: number,
    clientId: number,
  ): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id: clientId },
      relations: ['trainer'],
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    if (!client.trainer || client.trainer.id !== trainerId) {
      throw new ForbiddenException('Client is not assigned to this trainer');
    }

    return client;
  }

  async assertUserCanAccessClient(
    user: AuthUser,
    clientId: number,
  ): Promise<Client> {
    if (user.user_type === 'client') {
      this.assertOwnClient(
        user,
        clientId,
        'Clients can only access their own data',
      );
      const client = await this.clientRepository.findOne({
        where: { id: clientId },
        relations: ['trainer'],
      });

      if (!client) {
        throw new NotFoundException('Client not found');
      }

      return client;
    }

    return this.assertTrainerOwnsClient(user.sub, clientId);
  }

  async assertUserCanAccessChatWith(
    user: AuthUser,
    otherUserId: number,
  ): Promise<void> {
    if (user.user_type === 'client') {
      const client = await this.clientRepository.findOne({
        where: { id: user.sub },
        relations: ['trainer'],
      });

      if (!client) {
        throw new NotFoundException('Client not found');
      }

      if (!client.trainer || client.trainer.id !== otherUserId) {
        throw new ForbiddenException(
          'Clients can only access chat with their assigned trainer',
        );
      }

      return;
    }

    await this.assertTrainerOwnsClient(user.sub, otherUserId);
  }

  assertUserCanAccessClientResource(
    user: AuthUser,
    clientId: number,
    trainerId?: number | null,
  ): void {
    if (user.user_type === 'client') {
      if (user.sub !== clientId) {
        throw new ForbiddenException('Access denied');
      }
      return;
    }

    if (!trainerId || trainerId !== user.sub) {
      throw new ForbiddenException('Access denied');
    }
  }
}
