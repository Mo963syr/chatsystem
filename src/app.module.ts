// src/app.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb+srv://menuapp:qr7aXaG8rfSA1ERo@menuapp.mggtsul.mongodb.net/authsys?retryWrites=true&w=majority&appName=authsys',
    ),
    AuthModule,
    UsersModule,
    MessagesModule,
    ChatModule,
  ],
  controllers: [AppController], // ✅ تأكد من وجوده هنا
  providers: [AppService],      // ✅ تأكد من وجوده هنا
})
export class AppModule {}