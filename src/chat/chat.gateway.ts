// src/chat/chat.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || 'ACCESS_TOKEN_SECRET_CHANGE_ME';

// ✅ إضافة واجهات للبيانات
interface SendMessageDto {
  content: string;
  receiverId: string;
}

interface GetChatHistoryDto {
  userId1: string;
  userId2: string;
}

interface CheckUserStatusDto {
  userId: string;
}

interface JoinRoomDto {
  roomId: string;
}

interface MarkAsReadDto {
  messageId: string;
}

@WebSocketGateway({
  namespace: '/chat', // ← مهم جداً
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId
private getTokenFromCookie(cookie?: string): string | null {
  if (!cookie) return null;

  const match = cookie.match(/access_token=([^;]+)/);
  return match ? match[1] : null;
}

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  // عند اتصال المستخدم
async handleConnection(client: Socket) {
  try {
     console.log('🍪 Cookies:', client.handshake.headers.cookie);
     console.log('📤 Connected Users:', this.connectedUsers);
console.log('📤 Client ID:', client.id);

    const cookie = client.handshake.headers.cookie;
    const token = this.getTokenFromCookie(cookie);

    if (!token) {
      throw new Error('Unauthorized: No access_token cookie');
    }
const payload = this.jwtService.verify(token, {
  secret: ACCESS_TOKEN_SECRET,
});

    const userId = payload.sub;

    this.connectedUsers.set(userId, client.id);
    await this.usersService.updateOnlineStatus(userId, true);

    // إشعار الجميع
    this.server.emit('user-online', { userId });

    // إشعار المستخدم نفسه
    client.emit('user-connected', {
      userId,
      authenticated: true,
    });

    console.log(`✅ User ${userId} connected via cookie (${client.id})`);
  } catch (error) {
    console.error('❌ WS Auth error:', error.message);
    client.disconnect();
  }
}



  // عند انقطاع الاتصال
  async handleDisconnect(client: Socket) {
    const userId = Array.from(this.connectedUsers.entries()).find(
      ([, socketId]) => socketId === client.id,
    )?.[0];

    if (userId) {
      this.connectedUsers.delete(userId);
      
      // تحديث حالة الاتصال
      await this.usersService.updateOnlineStatus(userId, false);

      // إرسال إشعار للمستخدمين الآخرين
      this.server.emit('user-offline', { userId });

      console.log(`⚠️ User ${userId} disconnected`);
    }
  }

  // الانضمام إلى غرفة الدردشة الثنائية
  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;
    client.join(roomId);
    console.log(`Client ${client.id} joined room ${roomId}`);
    return { success: true, roomId };
  }

  // إرسال رسالة
  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // الحصول على معرف المرسل من الـ connected users
      const senderId = Array.from(this.connectedUsers.entries()).find(
        ([, socketId]) => socketId === client.id,
      )?.[0];

      if (!senderId) {
        throw new Error('User not authenticated');
      }

      const { content, receiverId } = data;

      // إنشاء معرف الغرفة
      const roomId = this.chatService.generateRoomId(senderId, receiverId);

      // حفظ الرسالة في قاعدة البيانات
      const message = await this.chatService.saveMessage(
        content,
        senderId,
        receiverId,
      );

      // ✅ تحويل الرسالة إلى كائن بشكل صحيح
      const msgObj: any =
        message && typeof (message as any).toObject === 'function'
          ? (message as any).toObject()
          : (message as any);

      const messageData = {
        _id: msgObj._id?.toString(),
        content: msgObj.content,
        sender: msgObj.sender,
        receiver: msgObj.receiver,
        roomId,
        delivered: msgObj.delivered ?? false,
        read: msgObj.read ?? false,
        readAt: msgObj.readAt ?? null,
        deliveredAt: msgObj.deliveredAt ?? null,
        createdAt: msgObj.createdAt ?? null,
        updatedAt: msgObj.updatedAt ?? null,
      };

      // إرسال للغرفة بأكملها (المرسل والمستقبل)
      this.server.to(roomId).emit('receive-message', messageData);

      // إذا كان المستقبل متصل، علّم الرسالة كـ delivered
      if (this.connectedUsers.has(receiverId)) {
        setTimeout(async () => {
          const updatedMessage = await this.chatService.markMessageDelivered(message._id.toString());
          
          this.server.to(roomId).emit('message-delivered', {
            messageId: message._id.toString(),
            deliveredAt: new Date(),
          });
        }, 500);
      }

      return { success: true, message: messageData };
    } catch (error) {
      console.error('Send message error:', error);
      return { success: false, error: error.message };
    }
  }

  // علامة القراءة
  @SubscribeMessage('mark-as-read')
  async handleMarkAsRead(
    @MessageBody() data: MarkAsReadDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { messageId } = data;
      const updatedMessage = await this.chatService.markMessageRead(messageId);

      // إرسال تحديث للغرفة
      this.server.emit('message-read', {
        messageId,
        readAt: new Date(),
      });

      return { success: true };
    } catch (error) {
      console.error('Mark as read error:', error);
      return { success: false, error: error.message };
    }
  }

  // الحصول على سجل المحادثة
  @SubscribeMessage('get-chat-history')
  async handleGetChatHistory(
    @MessageBody() data: GetChatHistoryDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { userId1, userId2 } = data;
      const messages = await this.chatService.getChatHistory(userId1, userId2);

      client.emit('chat-history', messages);
      return { success: true, count: messages.length };
    } catch (error) {
      console.error('Get chat history error:', error);
      return { success: false, error: error.message };
    }
  }

  // التحقق من حالة المستخدم
  @SubscribeMessage('check-user-status')
  async handleCheckUserStatus(
    @MessageBody() data: CheckUserStatusDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { userId } = data;
    const isOnline = this.connectedUsers.has(userId);
    client.emit('user-status', { userId, online: isOnline });
    return { success: true, userId, online: isOnline };
  }

  // ✅ إضافة ping/pong للتأكد من الاتصال
  @SubscribeMessage('ping')
  handlePing() {
    return { event: 'pong', timestamp: new Date().toISOString() };
  }
}
// ✅ إغلاق الكلاس هنا