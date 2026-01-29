// src/messages/messages.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async create(
    content: string,
    sender: string,
    receiver: string,
  ): Promise<MessageDocument> {
    // إنشاء معرف الغرفة الثنائية (مرتب أبجدياً لضمان نفس المعرف دائماً)
    const roomId = [sender, receiver].sort().join('_');

    const createdMessage = new this.messageModel({
      content,
      sender,
      receiver,
      roomId,
    });

    return createdMessage.save();
  }

  async findAllBetweenUsers(
    userId1: string,
    userId2: string,
  ): Promise<MessageDocument[]> {
    const roomId = [userId1, userId2].sort().join('_');

    return this.messageModel
      .find({ roomId })
      .sort({ createdAt: 1 }) // من الأقدم للأحدث
      .exec();
  }

  async markAsDelivered(messageId: string): Promise<MessageDocument> {
    const updatedMessage = await this.messageModel.findByIdAndUpdate(
      messageId,
      { delivered: true, deliveredAt: new Date() },
      { new: true },
    ).exec();

    if (!updatedMessage) {
      throw new NotFoundException(`الرسالة بالرقم ${messageId} غير موجودة`);
    }

    return updatedMessage;
  }

  async markAsRead(messageId: string): Promise<MessageDocument> {
    const updatedMessage = await this.messageModel.findByIdAndUpdate(
      messageId,
      { read: true, readAt: new Date() },
      { new: true },
    ).exec();

    if (!updatedMessage) {
      throw new NotFoundException(`الرسالة بالرقم ${messageId} غير موجودة`);
    }

    return updatedMessage;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.messageModel.countDocuments({
      receiver: userId,
      read: false,
    });
  }
}