import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ConflictException,
  BadRequestException,
  UseGuards,
  Request,
  Param,
  Put,
} from '@nestjs/common';
import { ClientService } from './client.service';
import type { CreateClientDto } from './client.service';
import { Client } from './client.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get()
  async findAll(): Promise<Client[]> {
    return await this.clientService.findAll();
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createClientDto: CreateClientDto): Promise<Client> {
    // Check if client already exists
    const existingClient = await this.clientService.findByEmail(createClientDto.email);
    if (existingClient !== null) {
      throw new ConflictException('Client with this email already exists');
    }

    // Basic validation
    if (!createClientDto.email || !createClientDto.password || !createClientDto.username) {
      throw new BadRequestException('Email, password, and username are required');
    }

    return await this.clientService.create(createClientDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req): Promise<Client> {
    console.log('Requesting profile for user:', req.user); // Логируем информацию о пользователе

    // Убедимся, что пользователь является клиентом
    if (req.user.user_type !== 'client') {
      throw new BadRequestException('Only clients can access their profile');
    }

    const client = await this.clientService.findById(req.user.sub);
    if (!client) {
      throw new BadRequestException('Client not found');
    }
    console.log('Returning client:', client); // Логируем возвращаемого клиента
    return client;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Request() req, @Param('id') id: string): Promise<Client> {
    const clientId = parseInt(id, 10);
    const client = await this.clientService.findById(clientId);
    if (!client) {
      throw new BadRequestException('Client not found');
    }
    return client;
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() updateClientDto: Partial<CreateClientDto>): Promise<Client> {
    // Убедимся, что пользователь является клиентом
    if (req.user.user_type !== 'client') {
      throw new BadRequestException('Only clients can update their profile');
    }

    const client = await this.clientService.findById(req.user.sub);
    if (!client) {
      throw new BadRequestException('Client not found');
    }

    // Обновляем только те поля, которые предоставлены в запросе
    Object.assign(client, updateClientDto);

    return await this.clientService.update(client.id, client);
  }
}