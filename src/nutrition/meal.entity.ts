import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { NutritionDay } from './nutrition-day.entity';

@Entity({ name: 'meals' })
export class Meal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => NutritionDay, (nutritionDay) => nutritionDay.meals, { nullable: false })
  @JoinColumn({ name: 'nutrition_day_id' })
  nutritionDay: NutritionDay;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}