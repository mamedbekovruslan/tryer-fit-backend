import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientNutritionPlan } from './client-nutrition-plan.entity';
import { CreateClientNutritionPlanDto } from './dto/create-client-nutrition-plan.dto';
import { UpdateClientNutritionPlanDto } from './dto/update-client-nutrition-plan.dto';
import { Client } from '../users/client.entity';
import { NutritionPlan } from './nutrition-plan.entity';

@Injectable()
export class ClientNutritionPlanService {
  constructor(
    @InjectRepository(ClientNutritionPlan)
    private clientNutritionPlanRepository: Repository<ClientNutritionPlan>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(NutritionPlan)
    private nutritionPlanRepository: Repository<NutritionPlan>,
  ) {}

  async findAll(): Promise<ClientNutritionPlan[]> {
    return await this.clientNutritionPlanRepository.find({
      relations: ['client', 'nutritionPlan', 'nutritionPlan.nutritionCategory'],
      order: { assignedAt: 'DESC' },
    });
  }

  async findByClientId(clientId: number): Promise<ClientNutritionPlan[]> {
    return await this.clientNutritionPlanRepository.find({
      where: { client: { id: clientId } },
      relations: ['client', 'nutritionPlan', 'nutritionPlan.nutritionCategory'],
      order: { assignedAt: 'DESC' },
    });
  }

  async findByClientIdAndActive(clientId: number): Promise<ClientNutritionPlan[]> {
    return await this.clientNutritionPlanRepository.find({
      where: { client: { id: clientId }, is_active: true },
      relations: ['client', 'nutritionPlan', 'nutritionPlan.nutritionCategory'],
      order: { assignedAt: 'DESC' },
    });
  }

  async create(planData: CreateClientNutritionPlanDto): Promise<ClientNutritionPlan> {
    // Проверяем, существует ли клиент
    const client = await this.clientRepository.findOne({
      where: { id: planData.clientId },
    });
    if (!client) {
      throw new NotFoundException(`Client with ID ${planData.clientId} not found`);
    }

    // Проверяем, существует ли план питания
    const nutritionPlan = await this.nutritionPlanRepository.findOne({
      where: { id: planData.nutritionPlanId },
    });
    if (!nutritionPlan) {
      throw new NotFoundException(`Nutrition plan with ID ${planData.nutritionPlanId} not found`);
    }

    const clientPlan = new ClientNutritionPlan();
    clientPlan.client = client;
    clientPlan.nutritionPlan = nutritionPlan;
    clientPlan.is_active = planData.isActive;

    return await this.clientNutritionPlanRepository.save(clientPlan);
  }

  async findOne(id: number): Promise<ClientNutritionPlan | null> {
    return await this.clientNutritionPlanRepository.findOne({
      where: { id },
      relations: ['client', 'nutritionPlan', 'nutritionPlan.nutritionCategory'],
    });
  }

  async update(id: number, planData: UpdateClientNutritionPlanDto): Promise<ClientNutritionPlan> {
    const existingPlan = await this.findOne(id);
    if (!existingPlan) {
      throw new NotFoundException(`Client nutrition plan with ID ${id} not found`);
    }

    if (planData.clientId) {
      const client = await this.clientRepository.findOne({
        where: { id: planData.clientId },
      });
      if (!client) {
        throw new NotFoundException(`Client with ID ${planData.clientId} not found`);
      }
      existingPlan.client = client;
    }

    if (planData.nutritionPlanId) {
      const nutritionPlan = await this.nutritionPlanRepository.findOne({
        where: { id: planData.nutritionPlanId },
      });
      if (!nutritionPlan) {
        throw new NotFoundException(`Nutrition plan with ID ${planData.nutritionPlanId} not found`);
      }
      existingPlan.nutritionPlan = nutritionPlan;
    }

    if (planData.isActive !== undefined) {
      existingPlan.is_active = planData.isActive;
    }

    await this.clientNutritionPlanRepository.update(id, {
      client: existingPlan.client,
      nutritionPlan: existingPlan.nutritionPlan,
      is_active: existingPlan.is_active,
    });

    const updatedPlan = await this.findOne(id);
    if (!updatedPlan) {
      throw new NotFoundException(`Client nutrition plan with ID ${id} not found after update`);
    }
    return updatedPlan;
  }

  async remove(id: number): Promise<void> {
    const plan = await this.findOne(id);
    if (!plan) {
      throw new NotFoundException(`Client nutrition plan with ID ${id} not found`);
    }
    await this.clientNutritionPlanRepository.delete(id);
  }
}