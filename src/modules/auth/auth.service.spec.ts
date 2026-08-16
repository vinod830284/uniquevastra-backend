import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService (Unit Tests)', () => {
  let service: AuthService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mocked_jwt_token'),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, fallback: string) => fallback),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should register a new customer successfully', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: 'usr-123',
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '+919876543210',
      status: 'ACTIVE',
      createdAt: new Date(),
    });

    const result = await service.register({
      name: 'Test Customer',
      email: 'test@example.com',
      password: 'SecurePassword123!',
    });

    expect(result.user.email).toBe('test@example.com');
    expect(result.tokens.accessToken).toBe('mocked_jwt_token');
    expect(mockPrisma.user.create).toHaveBeenCalled();
  });

  it('should throw ConflictException on duplicate email registration', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-id' });

    await expect(
      service.register({
        name: 'Duplicate User',
        email: 'test@example.com',
        password: 'Password123!',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should throw UnauthorizedException for invalid login credentials', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({ email: 'nonexistent@example.com', password: 'WrongPassword' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if account is BLOCKED', async () => {
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'blocked-usr',
      email: 'blocked@example.com',
      passwordHash: hashedPassword,
      status: 'BLOCKED',
    });

    await expect(
      service.login({ email: 'blocked@example.com', password: 'Password123!' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
