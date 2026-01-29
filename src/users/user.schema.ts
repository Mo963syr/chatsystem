import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: ['User', 'Admin'], required: true })
  role: string;

  
  @Prop({ default: Date.now })
  lastSeen: Date;

  @Prop({ default: true })
  online: boolean;

 
}

export const UserSchema = SchemaFactory.createForClass(User);
