import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

async create(dto: CreateUserDto) {
 

 if (!dto.email && !dto.password && !dto.confirmPassword) {
    throw new BadRequestException('All fields are required');
  }
  if (!dto.password) {
    throw new BadRequestException('Password is required');
  }
  if (!dto.name) {
    throw new BadRequestException('Name is required');
  }

  if (!dto.password) {
    throw new BadRequestException('Password is required');
  } 

  if (!dto.confirmPassword) {
  throw new BadRequestException('Confirm password is required');
}
if (dto.password !== dto.confirmPassword) {
  throw new BadRequestException('Passwords do not match');
}
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(dto.email)) {
  throw new BadRequestException('Invalid email format');
}

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(dto.password)) {
    throw new BadRequestException(
      'Password must be at least 8 characters long, contain at least one uppercase letter and one number'
    );
  }


  const exists = await this.userModel.findOne({ email: dto.email });
  if (exists) {
    throw new BadRequestException('Email or password is incorrect');
  }


  const hashedPassword = await bcrypt.hash(dto.password, 10);


  const createdUser = await this.userModel.create({
    ...dto,
    password: hashedPassword,
  });


  const { password, ...userWithoutPassword } = createdUser.toObject();
  return userWithoutPassword;
}


  findAll() {
    return this.userModel.find().select('-password');
  }
async findCurrentUser(userId: string) {
  return this.userModel.findById(userId).select('-password');
}

  findOne(id: string) {
    return this.userModel.findById(id);
  }

async update(id: string, dto: UpdateUserDto) {
  if ('password' in dto ) {
    throw new BadRequestException('Password cannot be updated through this endpoint');
  }
   const updatedUser = await this.userModel.findByIdAndUpdate(id, dto, { new: true });
   if (!updatedUser) {
     throw new NotFoundException('User not found');
   }
   return {
     _id: updatedUser._id,
     email: updatedUser.email,
     name: updatedUser.name,
     role: updatedUser.role,
   };
  }

  remove(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }
    async updateOnlineStatus(userId: string, online: boolean) {
    return this.userModel.findByIdAndUpdate(
      userId,
      { online, lastSeen: new Date() },
      { new: true },
    );
  }

  async findByIds(userIds: string[]): Promise<User[]> {
    return this.userModel
      .find({ _id: { $in: userIds } })
      .select('-password')
      .exec();
  }
}
