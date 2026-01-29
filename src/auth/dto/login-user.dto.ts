import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginUserDto {
  @IsNotEmpty({ message: ' email is require' })
  @IsEmail({}, { message: ' email format is invalid' })
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsNotEmpty({ message: ' password is require' })
  @IsString({ message: ' password must be a string' })
  password: string;
}