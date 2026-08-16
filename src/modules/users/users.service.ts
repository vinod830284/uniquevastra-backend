import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.phone && { phone: dto.phone }),
        ...(dto.avatarUrl && { avatarUrl: dto.avatarUrl }),
      },
    });

    const { passwordHash, ...result } = user;
    return result;
  }

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    return this.prisma.$transaction(async (tx) => {
      const count = await tx.address.count({ where: { userId } });
      const shouldBeDefault = dto.isDefault ?? count === 0;

      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          userId,
          name: dto.name,
          phone: dto.phone,
          addressLine1: dto.addressLine1,
          addressLine2: dto.addressLine2,
          city: dto.city,
          state: dto.state,
          postalCode: dto.postalCode,
          country: dto.country || 'India',
          isDefault: shouldBeDefault,
          type: dto.type || 'HOME',
        },
      });
    });
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    const existing = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existing) {
      throw new NotFoundException('Address not found');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('You do not have permission to modify this address');
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id: addressId },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.phone && { phone: dto.phone }),
          ...(dto.addressLine1 && { addressLine1: dto.addressLine1 }),
          ...(dto.addressLine2 !== undefined && { addressLine2: dto.addressLine2 }),
          ...(dto.city && { city: dto.city }),
          ...(dto.state && { state: dto.state }),
          ...(dto.postalCode && { postalCode: dto.postalCode }),
          ...(dto.country && { country: dto.country }),
          ...(dto.type && { type: dto.type }),
          ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
        },
      });
    });
  }

  async setDefaultAddress(userId: string, addressId: string) {
    const existing = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existing) {
      throw new NotFoundException('Address not found');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('You do not have permission to modify this address');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });

      return tx.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      });
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this address');
    }

    await this.prisma.address.delete({
      where: { id: addressId },
    });

    // If deleted address was default, promote remaining first address to default
    if (address.isDefault) {
      const remaining = await this.prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });
      if (remaining) {
        await this.prisma.address.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    return { message: 'Address deleted successfully' };
  }
}
