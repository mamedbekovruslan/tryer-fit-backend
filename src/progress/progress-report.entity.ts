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
import { Client } from '../users/client.entity';
import { ProgressReportComment } from './progress-report-comment.entity';

@Entity({ name: 'progress_reports' })
export class ProgressReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', nullable: false })
  date: Date;

  @Column({ name: 'weight', type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight?: number;

  @Column({ name: 'waist', type: 'decimal', precision: 5, scale: 2, nullable: true })
  waist?: number;

  @Column({ name: 'hips', type: 'decimal', precision: 5, scale: 2, nullable: true })
  hips?: number;

  @Column({ name: 'chest', type: 'decimal', precision: 5, scale: 2, nullable: true })
  chest?: number;

  @Column({ name: 'arms', type: 'decimal', precision: 5, scale: 2, nullable: true })
  arms?: number;

  @Column({ name: 'thighs', type: 'decimal', precision: 5, scale: 2, nullable: true })
  thighs?: number;

  @Column({ name: 'body_fat', type: 'decimal', precision: 5, scale: 2, nullable: true })
  bodyFat?: number;

  @Column({ name: 'muscle_mass', type: 'decimal', precision: 5, scale: 2, nullable: true })
  muscleMass?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'photo_urls', type: 'text', array: true, nullable: true })
  photoUrls?: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Client, { nullable: false })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @OneToMany(() => ProgressReportComment, (comment) => comment.report, {
    cascade: false,
  })
  comments?: ProgressReportComment[];
}
