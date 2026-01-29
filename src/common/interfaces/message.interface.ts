export interface IMessage {
  _id?: string;
  content: string;
  sender: string;
  receiver: string;
  roomId: string;
  delivered: boolean;
  read: boolean;
  readAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}