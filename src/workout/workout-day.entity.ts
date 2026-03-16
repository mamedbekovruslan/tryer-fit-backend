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
import { WorkoutProgram } from './workout-program.entity';
import { Exercise } from './exercise.entity';

@Entity({ name: 'workout_days' })
export class WorkoutDay {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'day_order', type: 'integer', default: 0 })
  dayOrder: number;

  @ManyToOne(() => WorkoutProgram, { nullable: false })
  @JoinColumn({ name: 'workout_program_id' })
  workoutProgram: WorkoutProgram;

  @OneToMany(() => Exercise, (exercise) => exercise.workoutDay, {
    cascade: true,
  })
  exercises: Exercise[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
