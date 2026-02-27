import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage, SenderType } from './chat-message.entity';
import { Client } from '../users/client.entity';
import { Trainer } from '../users/trainer.entity';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(Trainer)
    private trainerRepository: Repository<Trainer>,
  ) {}

  /**
   * Отправить сообщение
   */
  async sendMessage(
    senderId: number,
    sendMessageDto: SendMessageDto,
  ): Promise<ChatMessage> {
    const { receiverId, senderType, message } = sendMessageDto;

    // Проверка: если отправитель клиент, получатель должен быть его тренером
    if (senderType === SenderType.CLIENT) {
      const client = await this.clientRepository.findOne({
        where: { id: senderId },
        relations: ['trainer'],
      });

      if (!client) {
        throw new NotFoundException('Клиент не найден');
      }

      if (!client.trainer || client.trainer.id !== receiverId) {
        throw new ForbiddenException('Вы можете писать только своему закреплённому тренеру');
      }
    }

    // Проверка: если отправитель тренер, получатель должен быть его клиентом
    if (senderType === SenderType.TRAINER) {
      const trainer = await this.trainerRepository.findOne({
        where: { id: senderId },
      });

      if (!trainer) {
        throw new NotFoundException('Тренер не найден');
      }

      const client = await this.clientRepository.findOne({
        where: { id: receiverId },
        relations: ['trainer'],
      });

      if (!client) {
        throw new NotFoundException('Клиент не найден');
      }

      if (!client.trainer || client.trainer.id !== senderId) {
        throw new ForbiddenException('Вы можете писать только своим клиентам');
      }
    }

    const chatMessage = new ChatMessage();
    chatMessage.senderId = senderId;
    chatMessage.receiverId = receiverId;
    chatMessage.senderType = senderType;
    chatMessage.message = message;
    chatMessage.isRead = false;

    return await this.chatMessageRepository.save(chatMessage);
  }

  /**
   * Получить историю переписки между двумя пользователями
   */
  async getConversation(
    userId: number,
    otherUserId: number,
    limit: number = 50,
    offset: number = 0,
  ): Promise<ChatMessage[]> {
    const messages = await this.chatMessageRepository.find({
      where: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
      order: { createdAt: 'ASC' },
      take: limit,
      skip: offset,
    });

    return messages;
  }

  /**
   * Получить все чаты пользователя с последними сообщениями
   */
  async getUserChats(userId: number, userType: 'client' | 'trainer'): Promise<any[]> {
    console.log(`getUserChats called: userId=${userId}, userType=${userType}`);
    
    if (userType === 'client') {
      // Клиент имеет только один чат - со своим тренером
      const client = await this.clientRepository.findOne({
        where: { id: userId },
        relations: ['trainer'],
      });

      if (!client || !client.trainer) {
        console.log(`Client ${userId} has no trainer`);
        return [];
      }

      // Получаем последнее сообщение
      const lastMessage = await this.chatMessageRepository.findOne({
        where: [
          { senderId: userId, receiverId: client.trainer.id },
          { senderId: client.trainer.id, receiverId: userId },
        ],
        order: { createdAt: 'DESC' },
      });

      // Считаем непрочитанные сообщения
      const unreadCount = await this.chatMessageRepository.count({
        where: {
          senderId: client.trainer.id,
          receiverId: userId,
          isRead: false,
        },
      });

      return [{
        userId: client.trainer.id,
        username: `${client.trainer.first_name || ''} ${client.trainer.last_name || ''}`.trim() || client.trainer.username,
        lastMessage,
        unreadCount,
      }];
    } else {
      // Тренер имеет чаты со всеми своими клиентами
      const clients = await this.clientRepository.find({
        where: { trainer: { id: userId } },
        relations: ['trainer'],
      });
      
      console.log(`Trainer ${userId} has ${clients.length} clients`);

      const chats: any[] = [];
      for (const client of clients) {
        // Получаем последнее сообщение
        const lastMessage = await this.chatMessageRepository.findOne({
          where: [
            { senderId: userId, receiverId: client.id },
            { senderId: client.id, receiverId: userId },
          ],
          order: { createdAt: 'DESC' },
        });

        // Считаем непрочитанные сообщения
        const unreadCount = await this.chatMessageRepository.count({
          where: {
            senderId: client.id,
            receiverId: userId,
            isRead: false,
          },
        });

        chats.push({
          userId: client.id,
          username: `${client.first_name || ''} ${client.last_name || ''}`.trim() || client.username,
          email: client.email,
          lastMessage,
          unreadCount,
        });
      }

      return chats;
    }
  }

  /**
   * Отметить сообщения как прочитанные
   */
  async markMessagesAsRead(
    userId: number,
    senderId: number,
  ): Promise<void> {
    await this.chatMessageRepository.update(
      {
        senderId,
        receiverId: userId,
        isRead: false,
      },
      { isRead: true },
    );
  }

  /**
   * Получить непрочитанные сообщения
   */
  async getUnreadMessages(
    userId: number,
    senderId: number,
  ): Promise<ChatMessage[]> {
    return await this.chatMessageRepository.find({
      where: {
        senderId,
        receiverId: userId,
        isRead: false,
      },
      order: { createdAt: 'ASC' },
    });
  }
}
