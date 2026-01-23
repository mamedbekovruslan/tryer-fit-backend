import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Trainer } from './trainer.entity';

export enum FitnessGoal {
  WEIGHT_LOSS = 'weight_loss',
  MUSCLE_GAIN = 'muscle_gain',
  ENDURANCE = 'endurance',
  FLEXIBILITY = 'flexibility',
  GENERAL_FITNESS = 'general_fitness',
}

@Entity({ name: 'clients' })
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  username: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  password_hash: string;

  @Column({ nullable: true })
  first_name?: string;

  @Column({ nullable: true })
  last_name?: string;

  // Поля профиля
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  waist_circumference?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  chest_circumference?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  hip_circumference?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  arm_circumference?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  leg_circumference?: number;

  @Column({ type: 'enum', enum: FitnessGoal, nullable: true })
  fitness_goal?: FitnessGoal;

  @Column({ type: 'text', nullable: true })
  expected_result?: string;

  @Column({ type: 'text', nullable: true })
  contraindications?: string;

  @Column({ type: 'text', nullable: true })
  diseases?: string;

  @Column({ type: 'text', nullable: true })
  limitations?: string;

  @Column({ type: 'text', nullable: true })
  training_experience?: string;

  @Column({ type: 'text', nullable: true })
  current_diet?: string;

  @Column({ type: 'text', array: true, nullable: true })
  photo_urls?: string[];

  // Поля для хранения текущих данных прогресса
  @Column({ name: 'weight', type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight?: number;

  @Column({ name: 'body_fat', type: 'decimal', precision: 5, scale: 2, nullable: true })
  body_fat?: number;

  @Column({ name: 'muscle_mass', type: 'decimal', precision: 5, scale: 2, nullable: true })
  muscle_mass?: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Trainer, { nullable: true })
  @JoinColumn({ name: 'trainer_id' })
  trainer?: Trainer;
}