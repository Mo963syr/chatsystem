export interface IUser {
  id: string;
  username: string;
  email: string;
  online?: boolean;
  lastSeen?: Date;
}