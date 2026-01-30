import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { NutritionCategory } from '../nutrition/nutrition-category.entity';

@Entity({ name: 'nutrition_plans' })
export class NutritionPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => NutritionCategory, { nullable: false })
  @JoinColumn({ name: 'nutrition_category_id' })
  nutritionCategory: NutritionCategory;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}