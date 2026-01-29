import { Injectable } from '@nestjs/common';
import { MessagesService } from '../messages/messages.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChatService {
  constructor(
    private messagesService: MessagesService,
    private usersService: UsersService,
  ) {}

  // إنشاء معرف الغرفة الثنائية
  generateRoomId(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join('_');
  }

  // حفظ الرسالة وإرسالها
  async saveMessage(
    content: string,
    senderId: string,
    receiverId: string,
  ) {
    return this.messagesService.create(content, senderId, receiverId);
  }

  // تحديث حالة التسليم
  async markMessageDelivered(messageId: string) {
    return this.messagesService.markAsDelivered(messageId);
  }

  // تحديث حالة القراءة
  async markMessageRead(messageId: string) {
    return this.messagesService.markAsRead(messageId);
  }

  // الحصول على سجل المحادثة
  async getChatHistory(userId1: string, userId2: string) {
    return this.messagesService.findAllBetweenUsers(userId1, userId2);
  }

  // تحديث حالة الاتصال
  async updateOnlineStatus(userId: string, online: boolean) {
    return this.usersService.updateOnlineStatus(userId, online);
  }
}