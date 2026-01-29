import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'ACCESS_TOKEN_SECRET_CHANGE_ME';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'REFRESH_TOKEN_SECRET_CHANGE_ME';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService, 
  ) {}

  private async signTokens(payload: JwtPayload) {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: ACCESS_TOKEN_SECRET,
      expiresIn: '15m', 
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: REFRESH_TOKEN_SECRET,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async login(dto: LoginUserDto) {
    const { email, password } = dto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const { accessToken, refreshToken } = await this.signTokens(payload);

    const { password: _, ...safeUser } = user.toObject();
    return {
      message: 'Login success',
      accessToken,
      refreshToken,
      user: safeUser,
      token: accessToken,
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: REFRESH_TOKEN_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userModel.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    const newPayload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role
    };

    const { accessToken, refreshToken: newRefreshToken } = await this.signTokens(newPayload);

    return {
      message: 'Tokens refreshed',
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}