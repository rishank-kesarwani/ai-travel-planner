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

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
  ) {}

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
