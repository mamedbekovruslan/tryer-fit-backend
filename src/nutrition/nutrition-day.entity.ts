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
import { NutritionPlan } from './nutrition-plan.entity';
import { Meal } from './meal.entity';

@Entity({ name: 'nutrition_days' })
export class NutritionDay {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'nutrition_category_id', nullable: true })
  nutritionCategoryId?: number;

  @ManyToOne(() => NutritionPlan, { nullable: false })
  @JoinColumn({ name: 'nutrition_plan_id' })
  nutritionPlan: NutritionPlan;

  @OneToMany(() => Meal, (meal) => meal.nutritionDay, { cascade: true })
  meals: Meal[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
