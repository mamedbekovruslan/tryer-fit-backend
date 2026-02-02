import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Client } from '../users/client.entity';
import { NutritionPlan } from './nutrition-plan.entity';

@Entity({ name: 'client_nutrition_plans' })
export class ClientNutritionPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Client, { nullable: false })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(() => NutritionPlan, { nullable: false })
  @JoinColumn({ name: 'nutrition_plan_id' })
  nutritionPlan: NutritionPlan;

  @Column({ type: 'boolean', default: false })
  is_active: boolean; // Поле для указания активности плана

  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}