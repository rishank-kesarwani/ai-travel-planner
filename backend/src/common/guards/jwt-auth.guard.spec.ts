import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IS_OPTIONAL_AUTH_KEY } from '../decorators/optional-auth.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if route is marked @Public()', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return true;
      return false;
    });

    const mockContext = {
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should allow unauthenticated access on @OptionalAuth() route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === IS_OPTIONAL_AUTH_KEY) return true;
      return false;
    });

    const mockContext = {
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    const user = guard.handleRequest(null, null, null, mockContext);
    expect(user).toBeNull();
  });

  it('should return authenticated user on @OptionalAuth() route when token is present', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === IS_OPTIONAL_AUTH_KEY) return true;
      return false;
    });

    const mockUser = { userId: 'u123', email: 'test@example.com' };
    const mockContext = {
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    const user = guard.handleRequest(null, mockUser, null, mockContext);
    expect(user).toEqual(mockUser);
  });

  it('should reject unauthenticated access on @OptionalAuth() route if PUBLIC_ACCESS_ENABLED=false', () => {
    const mockConfigService = {
      get: jest.fn().mockReturnValue(false),
    } as any;
    const strictGuard = new JwtAuthGuard(reflector, mockConfigService);

    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === IS_OPTIONAL_AUTH_KEY) return true;
      return false;
    });

    const mockContext = {
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    expect(() => strictGuard.handleRequest(null, null, null, mockContext)).toThrow(
      UnauthorizedException,
    );
  });

  it('should reject unauthenticated access on protected route without @OptionalAuth or @Public', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const mockContext = {
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    expect(() => guard.handleRequest(null, null, null, mockContext)).toThrow(
      UnauthorizedException,
    );
  });

  it('should pass authenticated user on protected route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const mockUser = { userId: 'u123', email: 'test@example.com' };
    const mockContext = {
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    const result = guard.handleRequest(null, mockUser, null, mockContext);
    expect(result).toEqual(mockUser);
  });
});
