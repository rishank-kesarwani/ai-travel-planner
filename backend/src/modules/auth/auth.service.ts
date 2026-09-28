import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { NotificationService } from '../notifications/notification.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtPayload } from '../../common/interfaces/auth-user.interface';
import { UserRole } from '../../common/enums/roles.enum';

import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
  ) {}

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const user = await this.usersService.setResetPasswordToken(email, tokenHash, expires);
    if (user) {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
      const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

      this.notificationService
        .sendPasswordResetNotification({
          id: (user as any)._id.toString(),
          email: user.email,
          name: user.name,
          resetUrl,
        })
        .catch(() => {});
    }

    return {
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    if (!token) {
      throw new BadRequestException('Reset token is required');
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.usersService.findByResetPasswordToken(tokenHash);
    if (!user) {
      throw new BadRequestException('Password reset token is invalid or has expired');
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await this.usersService.resetPassword((user as any)._id.toString(), newPasswordHash);

    return {
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    };
  }

  async register(registerDto: RegisterDto) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    const user = await this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      passwordHash,
      role: UserRole.USER,
      preferences: registerDto.preferences,
    });

    const tokens = await this.generateTokens((user as any)._id.toString(), user.email, user.role, user.name);
    await this.updateRefreshTokenHash((user as any)._id.toString(), tokens.refreshToken);

    // Send Welcome Email & Push Notification asynchronously via Notification Service
    this.notificationService
      .sendWelcomeNotification({
        id: (user as any)._id.toString(),
        email: user.email,
        name: user.name,
      })
      .catch(() => {});

    return {
      user: {
        id: (user as any)._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const userId = (user as any)._id.toString();
    const tokens = await this.generateTokens(userId, user.email, user.role, user.name);
    await this.updateRefreshTokenHash(userId, tokens.refreshToken);

    return {
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
      },
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      }) as JwtPayload;

      const user = await this.usersService.findById(payload.sub);
      if (!user || !(user as any).refreshTokenHash) {
        throw new UnauthorizedException('Access Denied');
      }

      const isMatch = await bcrypt.compare(refreshToken, (user as any).refreshTokenHash);
      if (!isMatch) {
        throw new UnauthorizedException('Access Denied');
      }

      const userId = (user as any)._id.toString();
      const tokens = await this.generateTokens(userId, user.email, user.role, user.name);
      await this.updateRefreshTokenHash(userId, tokens.refreshToken);

      return {
        user: {
          id: userId,
          name: user.name,
          email: user.email,
          role: user.role,
          preferences: user.preferences,
        },
        ...tokens,
      };
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { success: true, message: 'Successfully logged out' };
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    return {
      id: (user as any)._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      preferences: user.preferences,
      createdAt: (user as any).createdAt,
      updatedAt: (user as any).updatedAt,
    };
  }

  private async generateTokens(userId: string, email: string, role: UserRole, name?: string) {
    const payload: JwtPayload = { sub: userId, email, role, name };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: this.configService.get<string>('jwt.accessExpiration', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiration', '7d'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900, // 15m in seconds
    };
  }

  private async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(refreshToken, salt);
    await this.usersService.updateRefreshToken(userId, hash);
  }
}
