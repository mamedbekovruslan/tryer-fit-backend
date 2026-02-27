import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

interface JwtPayload {
  email: string;
  sub: number;
  user_type: 'client' | 'trainer';
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: 'chat',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');
  private connectedClients: Map<number, string> = new Map(); // userId -> socketId

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Chat Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.query.token;

      if (!token) {
        this.logger.warn('Connection attempt without token');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<JwtPayload>(token);
      const userId = payload.sub;
      const userType = payload.user_type;

      client.data.userId = userId;
      client.data.userType = userType;

      // Сохраняем подключение
      this.connectedClients.set(userId, client.id);

      this.logger.log(`Client connected: ${userId} (${userType}) - Socket: ${client.id}`);

      // Отправляем подтверждение подключения
      client.emit('connected', { userId, userType });
    } catch (error: any) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.connectedClients.delete(userId);
      this.logger.log(`Client disconnected: ${userId}`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageDto,
  ) {
    try {
      const senderId = client.data.userId;
      const senderType = client.data.userType;

      if (!senderId) {
        throw new UnauthorizedException('User not authenticated');
      }

      // Отправляем сообщение через сервис
      const message = await this.chatService.sendMessage(senderId, data);

      // Находим socket получателя
      const receiverSocketId = this.connectedClients.get(data.receiverId);

      if (receiverSocketId) {
        // Отправляем сообщение получателю в реальном времени
        this.server.to(receiverSocketId).emit('receiveMessage', {
          id: message.id,
          senderId: message.senderId,
          receiverId: message.receiverId,
          senderType: message.senderType,
          message: message.message,
          isRead: message.isRead,
          createdAt: message.createdAt,
        });
      }

      // Отправляем подтверждение отправителю
      client.emit('messageSent', {
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        senderType: message.senderType,
        message: message.message,
        isRead: message.isRead,
        createdAt: message.createdAt,
      });

      this.logger.log(`Message sent from ${senderId} to ${data.receiverId}`);

      return message;
    } catch (error: any) {
      this.logger.error(`Send message error: ${error.message}`);
      client.emit('error', { message: error.message });
      throw error;
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { senderId: number },
  ) {
    try {
      const userId = client.data.userId;

      if (!userId) {
        throw new UnauthorizedException('User not authenticated');
      }

      await this.chatService.markMessagesAsRead(userId, data.senderId);

      // Уведомляем отправителя о прочтении
      const senderSocketId = this.connectedClients.get(data.senderId);
      if (senderSocketId) {
        this.server.to(senderSocketId).emit('messagesRead', {
          userId,
          senderId: data.senderId,
        });
      }

      this.logger.log(`Messages marked as read by ${userId} from ${data.senderId}`);
    } catch (error: any) {
      this.logger.error(`Mark as read error: ${error.message}`);
      client.emit('error', { message: error.message });
      throw error;
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: number, isTyping: boolean },
  ) {
    const senderId = client.data.userId;
    const senderType = client.data.userType;

    const receiverSocketId = this.connectedClients.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('userTyping', {
        senderId,
        senderType,
        isTyping: data.isTyping,
      });
    }
  }
}
