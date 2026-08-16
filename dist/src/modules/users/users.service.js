"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                addresses: {
                    orderBy: { isDefault: 'desc' },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User profile not found');
        }
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async updateProfile(userId, dto) {
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
    async getAddresses(userId) {
        return this.prisma.address.findMany({
            where: { userId },
            orderBy: { isDefault: 'desc' },
        });
    }
    async createAddress(userId, dto) {
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
    async updateAddress(userId, addressId, dto) {
        const existing = await this.prisma.address.findUnique({
            where: { id: addressId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Address not found');
        }
        if (existing.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to modify this address');
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
    async setDefaultAddress(userId, addressId) {
        const existing = await this.prisma.address.findUnique({
            where: { id: addressId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Address not found');
        }
        if (existing.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to modify this address');
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
    async deleteAddress(userId, addressId) {
        const address = await this.prisma.address.findUnique({
            where: { id: addressId },
        });
        if (!address) {
            throw new common_1.NotFoundException('Address not found');
        }
        if (address.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to delete this address');
        }
        await this.prisma.address.delete({
            where: { id: addressId },
        });
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map