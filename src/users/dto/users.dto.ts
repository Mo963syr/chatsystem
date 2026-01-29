export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: string;
  confirmPassword: any;
}

export class UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}
