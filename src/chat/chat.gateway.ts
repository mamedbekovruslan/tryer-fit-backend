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
import type { JwtPayload, UserType } from '../auth/auth.types';

interface SocketAuthData {
  userId?: number;
  userType?: UserType;
}

function getSocketAuthData(client: Socket): SocketAuthData {
  return client.data as SocketAuthData;
}

function extractTokenFromHandshake(client: Socket): string | null {
  const auth = client.handshake.auth as Record<string, unknown>;
  const authToken = auth.token;
  if (typeof authToken === 'string' && authToken.length > 0) {
    return authToken;
  }

  const queryToken = client.handshake.query.token;
  if (typeof queryToken === 'string' && queryToken.length > 0) {
    return queryToken;
  }

  return extractTokenFromCookieHeader(client.handshake.headers.cookie);
}

function extractTokenFromCookieHeader(cookieHeader?: string): string | null {
  if (!cookieHeader) {
    return null;
  }

  const tokenCookie = cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith('token='));

  return tokenCookie
    ? decodeURIComponent(tokenCookie.slice('token='.length))
    : null;
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
  private server: Server;

  private readonly logger: Logger = new Logger('ChatGateway');
  private readonly connectedClients: Map<number, string> = new Map();

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
  ) {}

  afterInit() {
    this.logger.log('Chat Gateway initialized');
  }

  handleConnection(client: Socket) {
    try {
      const token = extractTokenFromHandshake(client);

      if (!token) {
        this.logger.warn('Connection attempt without token');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<JwtPayload>(token);
      const userId = payload.sub;
      const userType: UserType = payload.user_type;
      const socketData = getSocketAuthData(client);

      socketData.userId = userId;
      socketData.userType = userType;

      this.connectedClients.set(userId, client.id);

      this.logger.log(
        `Client connected: ${userId} (${userType}) - Socket: ${client.id}`,
      );

      client.emit('connected', { userId, userType });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown connection error';
      this.logger.error(`Connection error: ${message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = getSocketAuthData(client).userId;
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
      const senderId = getSocketAuthData(client).userId;

      if (!senderId) {
        throw new UnauthorizedException('User not authenticated');
      }

      const message = await this.chatService.sendMessage(senderId, data);

      const receiverSocketId = this.connectedClients.get(data.receiverId);

      if (receiverSocketId) {
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
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown send message error';
      this.logger.error(`Send message error: ${message}`);
      client.emit('error', { message });
      throw error;
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { senderId: number },
  ) {
    try {
      const userId = getSocketAuthData(client).userId;

      if (!userId) {
        throw new UnauthorizedException('User not authenticated');
      }

      await this.chatService.markMessagesAsRead(userId, data.senderId);

      const senderSocketId = this.connectedClients.get(data.senderId);
      if (senderSocketId) {
        this.server.to(senderSocketId).emit('messagesRead', {
          userId,
          senderId: data.senderId,
        });
      }

      this.logger.log(
        `Messages marked as read by ${userId} from ${data.senderId}`,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown mark as read error';
      this.logger.error(`Mark as read error: ${message}`);
      client.emit('error', { message });
      throw error;
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: number; isTyping: boolean },
  ) {
    const { userId: senderId, userType: senderType } =
      getSocketAuthData(client);

    const receiverSocketId = this.connectedClients.get(data.receiverId);
    if (receiverSocketId && senderId && senderType) {
      this.server.to(receiverSocketId).emit('userTyping', {
        senderId,
        senderType,
        isTyping: data.isTyping,
      });
    }
  }
}
