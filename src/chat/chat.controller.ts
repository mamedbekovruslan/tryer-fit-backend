import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AccessControlService } from '../auth/access-control.service';
import { SendMessageDto } from './dto/send-message.dto';
import {
  ChatMessageResponse,
  ChatSummaryResponse,
  toChatMessageResponse,
  toChatSummaryResponse,
} from './chat-response';
import type { AuthenticatedRequest } from '../auth/auth.types';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly accessControlService: AccessControlService,
  ) {}

  /**
   * Получить историю переписки с пользователем
   */
  @Get('messages/:userId')
  async getConversation(
    @Request() req: AuthenticatedRequest,
    @Param('userId', ParseIntPipe) otherUserId: number,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<ChatMessageResponse[]> {
    const userId = req.user.sub;
    await this.accessControlService.assertUserCanAccessChatWith(
      req.user,
      otherUserId,
    );
    const messages = await this.chatService.getConversation(
      userId,
      parseInt(otherUserId.toString(), 10),
      limit ? parseInt(limit.toString(), 10) : 50,
      offset ? parseInt(offset.toString(), 10) : 0,
    );
    return messages.map(toChatMessageResponse);
  }

  /**
   * Получить все чаты пользователя
   */
  @Get('chats')
  async getUserChats(
    @Request() req: AuthenticatedRequest,
  ): Promise<ChatSummaryResponse[]> {
    const userId = req.user.sub;
    const userType = req.user.user_type;
    const chats = await this.chatService.getUserChats(userId, userType);
    return chats.map(toChatSummaryResponse);
  }

  /**
   * Отправить сообщение (REST API, если WebSocket недоступен)
   */
  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Request() req: AuthenticatedRequest,
    @Body() sendMessageDto: SendMessageDto,
  ): Promise<ChatMessageResponse> {
    const senderId = req.user.sub;
    const message = await this.chatService.sendMessage(
      senderId,
      sendMessageDto,
    );
    return toChatMessageResponse(message);
  }

  /**
   * Отметить сообщения как прочитанные
   */
  @Patch('messages/:senderId/read')
  @HttpCode(HttpStatus.OK)
  async markMessagesAsRead(
    @Request() req: AuthenticatedRequest,
    @Param('senderId', ParseIntPipe) senderId: number,
  ) {
    const userId = req.user.sub;
    await this.accessControlService.assertUserCanAccessChatWith(
      req.user,
      senderId,
    );
    await this.chatService.markMessagesAsRead(userId, senderId);
    return { success: true };
  }

  /**
   * Получить непрочитанные сообщения
   */
  @Get('messages/unread/:senderId')
  async getUnreadMessages(
    @Request() req: AuthenticatedRequest,
    @Param('senderId', ParseIntPipe) senderId: number,
  ): Promise<ChatMessageResponse[]> {
    const userId = req.user.sub;
    await this.accessControlService.assertUserCanAccessChatWith(
      req.user,
      senderId,
    );
    const messages = await this.chatService.getUnreadMessages(userId, senderId);
    return messages.map(toChatMessageResponse);
  }
}
