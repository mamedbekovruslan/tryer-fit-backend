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
  NotFoundException,
} from '@nestjs/common';
import { ClientService } from './client.service';
import type { CreateClientDto } from './client.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ClientResponse, toClientResponse } from './user-response';
import { AccessControlService } from '../auth/access-control.service';
import type { AuthenticatedRequest } from '../auth/auth.types';

@Controller('clients')
export class ClientController {
  constructor(
    private readonly clientService: ClientService,
    private readonly accessControlService: AccessControlService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Request() req: AuthenticatedRequest,
  ): Promise<ClientResponse[]> {
    this.accessControlService.assertTrainer(
      req.user,
      'Only trainers can access clients list',
    );

    const clients = await this.clientService.findAll();
    return clients.map(toClientResponse);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() createClientDto: CreateClientDto,
  ): Promise<ClientResponse> {
    const existingClient = await this.clientService.findByEmail(
      createClientDto.email,
    );
    if (existingClient !== null) {
      throw new ConflictException('Client with this email already exists');
    }

    if (
      !createClientDto.email ||
      !createClientDto.password ||
      !createClientDto.username
    ) {
      throw new BadRequestException(
        'Email, password, and username are required',
      );
    }

    const client = await this.clientService.create(createClientDto);
    return toClientResponse(client);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(
    @Request() req: AuthenticatedRequest,
  ): Promise<ClientResponse> {
    this.accessControlService.assertClient(
      req.user,
      'Only clients can access their profile',
    );

    const client = await this.clientService.findById(req.user.sub);
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return toClientResponse(client);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<ClientResponse> {
    const clientId = parseInt(id, 10);
    await this.accessControlService.assertUserCanAccessClient(
      req.user,
      clientId,
    );
    const client = await this.clientService.findById(clientId);
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return toClientResponse(client);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() updateClientDto: Partial<CreateClientDto>,
  ): Promise<ClientResponse> {
    this.accessControlService.assertClient(
      req.user,
      'Only clients can update their profile',
    );

    const client = await this.clientService.findById(req.user.sub);
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    Object.assign(client, updateClientDto);

    const updatedClient = await this.clientService.update(client.id, client);
    return toClientResponse(updatedClient);
  }
}
