import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WorkoutDay } from './workout-day.entity';

@Entity({ name: 'exercises' })
export class Exercise {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'integer', nullable: true, comment: 'Количество подходов' })
  sets?: number;

  @Column({ length: 50, nullable: true, comment: 'Количество повторений' })
  reps?: string;

  @Column({ length: 50, nullable: true, comment: 'Вес' })
  weight?: string;

  @Column({ name: 'rest_time', length: 50, nullable: true, comment: 'Время отдыха' })
  restTime?: string;

  @Column({ name: 'exercise_order', type: 'integer', default: 0 })
  exerciseOrder: number;

  @ManyToOne(() => WorkoutDay, { nullable: false })
  @JoinColumn({ name: 'workout_day_id' })
  workoutDay: WorkoutDay;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
