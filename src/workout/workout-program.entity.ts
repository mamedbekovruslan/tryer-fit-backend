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
import { WorkoutCategory } from './workout-category.entity';
import { Trainer } from '../users/trainer.entity';
import { WorkoutDay } from './workout-day.entity';

@Entity({ name: 'workout_programs' })
export class WorkoutProgram {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => WorkoutCategory, { nullable: false })
  @JoinColumn({ name: 'workout_category_id' })
  workoutCategory: WorkoutCategory;

  @ManyToOne(() => Trainer, { nullable: true, eager: false })
  @JoinColumn({ name: 'trainer_id' })
  trainer?: Trainer;

  @OneToMany(() => WorkoutDay, (workoutDay) => workoutDay.workoutProgram, { cascade: true })
  workoutDays: WorkoutDay[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
