import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Client } from './client.entity';

@Entity({ name: 'trainers' })
export class Trainer {
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

  @Column({ nullable: true })
  middle_name?: string;

  @Column({ nullable: true })
  gender?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight?: number;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'date', nullable: true })
  birth_date?: Date;

  // Поля профиля тренера
  @Column({ type: 'text', nullable: true })
  education?: string;

  @Column({ type: 'text', nullable: true })
  institution?: string;

  @Column({ type: 'text', nullable: true })
  degree?: string;

  @Column({ type: 'text', nullable: true })
  specialization?: string;

  @Column({ type: 'text', nullable: true })
  certificate_number?: string;

  @Column({ type: 'text', array: true, nullable: true })
  photo_urls?: string[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToMany(() => Client, client => client.trainer)
  clients?: Client[];
}