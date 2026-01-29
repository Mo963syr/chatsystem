import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('between/:userId1/:userId2')
  findAllBetween(
    @Param('userId1') userId1: string,
    @Param('userId2') userId2: string,
  ) {
    return this.messagesService.findAllBetweenUsers(userId1, userId2);
  }

  @Get('unread-count')
  getUnreadCount(@Query('userId') userId: string) {
    return this.messagesService.getUnreadCount(userId);
  }
}