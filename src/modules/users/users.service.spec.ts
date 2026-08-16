import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../database/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('UsersService (Unit Tests & Security Isolation)', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    address: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('SECURITY TEST: Should throw ForbiddenException when User A attempts to update User B address', async () => {
    // Address belongs to User B ('user-B-uuid')
    mockPrisma.address.findUnique.mockResolvedValue({
      id: 'addr-123',
      userId: 'user-B-uuid',
      name: 'User B',
    });

    // Request made by User A ('user-A-uuid')
    await expect(
      service.updateAddress('user-A-uuid', 'addr-123', { name: 'Hacked Name' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('SECURITY TEST: Should throw ForbiddenException when User A attempts to delete User B address', async () => {
    mockPrisma.address.findUnique.mockResolvedValue({
      id: 'addr-123',
      userId: 'user-B-uuid',
    });

    await expect(service.deleteAddress('user-A-uuid', 'addr-123')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('Should set target address as default and unset other defaults transactionally', async () => {
    mockPrisma.address.findUnique.mockResolvedValue({
      id: 'addr-123',
      userId: 'user-A-uuid',
      isDefault: false,
    });
    mockPrisma.address.update.mockResolvedValue({
      id: 'addr-123',
      userId: 'user-A-uuid',
      isDefault: true,
    });

    const result = await service.setDefaultAddress('user-A-uuid', 'addr-123');

    expect(mockPrisma.address.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-A-uuid' },
      data: { isDefault: false },
    });
    expect(result.isDefault).toBe(true);
  });
});
