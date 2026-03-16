import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsEnum,
  MinLength,
} from 'class-validator';
import { SenderType } from '../chat-message.entity';

export class SendMessageDto {
  @IsInt()
  @IsNotEmpty()
  receiverId: number;

  @IsEnum(SenderType)
  @IsNotEmpty()
  senderType: SenderType;

  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Сообщение не может быть пустым' })
  message: string;
}
