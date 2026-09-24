import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { NotificationService } from '../notifications/notification.service';
import { UserRole } from '../../common/enums/roles.enum';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Travel Enthusiast',
    email: 'traveler@example.com',
    passwordHash: '',
    role: UserRole.USER,
    preferences: { budgetRange: 'moderate' },
  };

  beforeAll(async () => {
    mockUser.passwordHash = await bcrypt.hash('Secret123!', 10);
  });

  beforeEach(async () => {
    usersService = {
      create: jest.fn().mockResolvedValue(mockUser),
      findByEmail: jest.fn().mockImplementation(async (email) => {
        if (email === mockUser.email) return mockUser as any;
        return null;
      }),
      findById: jest.fn().mockResolvedValue(mockUser as any),
      updateRefreshToken: jest.fn().mockResolvedValue(undefined),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mocked.jwt.token'),
      verify: jest.fn().mockReturnValue({ sub: mockUser._id, email: mockUser.email, role: UserRole.USER }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        {
          provide: NotificationService,
          useValue: {
            sendWelcomeNotification: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'jwt.accessSecret') return 'test_access_secret';
              if (key === 'jwt.refreshSecret') return 'test_refresh_secret';
              return null;
            }),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should register a new user with hashed password and return tokens', async () => {
    const result = await authService.register({
      name: 'Travel Enthusiast',
      email: 'traveler@example.com',
      password: 'Secret123!',
    });

    expect(result.user.email).toBe('traveler@example.com');
    expect(result.accessToken).toBe('mocked.jwt.token');
    expect(result.refreshToken).toBe('mocked.jwt.token');
    expect(usersService.create).toHaveBeenCalled();
  });

  it('should successfully log in a user with valid credentials', async () => {
    const result = await authService.login({
      email: 'traveler@example.com',
      password: 'Secret123!',
    });

    expect(result.user.email).toBe('traveler@example.com');
    expect(result.accessToken).toBe('mocked.jwt.token');
  });

  it('should throw UnauthorizedException on invalid password', async () => {
    await expect(
      authService.login({
        email: 'traveler@example.com',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
