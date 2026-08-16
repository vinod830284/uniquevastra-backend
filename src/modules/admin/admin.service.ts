import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: AdminLoginDto) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { email: loginDto.email },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid admin credentials or account disabled');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, admin.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    const payload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      isAdmin: true,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET', 'super-secret-jwt-key-uniquevastra-2026'),
      expiresIn: '8h', // Admin sessions valid for 8 hours
    });

    return {
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      accessToken,
      tokenType: 'Bearer',
    };
  }

  async createAdminUser(dto: CreateAdminDto) {
    const existing = await this.prisma.adminUser.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Admin user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const admin = await this.prisma.adminUser.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        role: dto.role || 'ADMIN',
      },
    });

    const { passwordHash: _, ...result } = admin;
    return result;
  }

  async listAdminUsers() {
    const admins = await this.prisma.adminUser.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return admins.map(({ passwordHash, ...rest }) => rest);
  }
}
