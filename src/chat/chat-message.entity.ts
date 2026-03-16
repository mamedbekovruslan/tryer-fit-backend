import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SenderType {
  CLIENT = 'client',
  TRAINER = 'trainer',
}

@Entity({ name: 'chat_messages' })
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sender_id', nullable: false })
  senderId: number;

  @Column({ name: 'receiver_id', nullable: false })
  receiverId: number;

  @Column({
    name: 'sender_type',
    type: 'enum',
    enum: SenderType,
    nullable: false,
  })
  senderType: SenderType;

  @Column({ type: 'text', nullable: false })
  message: string;

  @Column({ name: 'is_read', default: false, nullable: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
