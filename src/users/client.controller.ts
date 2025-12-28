import { Controller, Get, Post, Body, HttpCode, HttpStatus, ConflictException, BadRequestException } from '@nestjs/common';
import { ClientService } from './client.service';
import type { CreateClientDto } from './client.service';
import { Client } from './client.entity';

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
}