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
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Получить историю переписки с пользователем
   */
  @Get('messages/:userId')
  async getConversation(
    @Request() req,
    @Param('userId') otherUserId: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const userId = req.user.sub;
    const messages = await this.chatService.getConversation(
      userId,
      parseInt(otherUserId.toString(), 10),
      limit ? parseInt(limit.toString(), 10) : 50,
      offset ? parseInt(offset.toString(), 10) : 0,
    );
    return messages;
  }

  /**
   * Получить все чаты пользователя
   */
  @Get('chats')
  async getUserChats(@Request() req) {
    const userId = req.user.sub;
    const userType = req.user.user_type;
    return await this.chatService.getUserChats(userId, userType);
  }

  /**
   * Отправить сообщение (REST API, если WebSocket недоступен)
   */
  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(@Request() req, @Body() sendMessageDto: SendMessageDto) {
    const senderId = req.user.sub;
    return await this.chatService.sendMessage(senderId, sendMessageDto);
  }

  /**
   * Отметить сообщения как прочитанные
   */
  @Patch('messages/:senderId/read')
  @HttpCode(HttpStatus.OK)
  async markMessagesAsRead(@Request() req, @Param('senderId') senderId: number) {
    const userId = req.user.sub;
    await this.chatService.markMessagesAsRead(userId, parseInt(senderId.toString(), 10));
    return { success: true };
  }

  /**
   * Получить непрочитанные сообщения
   */
  @Get('messages/unread/:senderId')
  async getUnreadMessages(@Request() req, @Param('senderId') senderId: number) {
    const userId = req.user.sub;
    return await this.chatService.getUnreadMessages(
      userId,
      parseInt(senderId.toString(), 10),
    );
  }
}
