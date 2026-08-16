"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const prisma_service_1 = require("../../database/prisma.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(registerDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerDto.email.toLowerCase() },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);
        const user = await this.prisma.user.create({
            data: {
                name: registerDto.name,
                email: registerDto.email.toLowerCase(),
                phone: registerDto.phone,
                passwordHash,
            },
        });
        const tokens = await this.generateAndStoreTokens(user.id, user.email, 'CUSTOMER');
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                avatarUrl: user.avatarUrl,
                status: user.status,
                createdAt: user.createdAt,
            },
            tokens,
        };
    }
    async login(loginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email.toLowerCase() },
        });
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status === 'BLOCKED') {
            throw new common_1.UnauthorizedException('Account is blocked. Please contact customer support.');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const tokens = await this.generateAndStoreTokens(user.id, user.email, 'CUSTOMER');
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                avatarUrl: user.avatarUrl,
                status: user.status,
                createdAt: user.createdAt,
            },
            tokens,
        };
    }
    async refreshToken(refreshTokenDto) {
        try {
            const refreshSecret = this.configService.get('JWT_REFRESH_SECRET', 'super-secret-refresh-key-uniquevastra-2026');
            const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
                secret: refreshSecret,
            });
            const tokenHash = this.hashToken(refreshTokenDto.refreshToken);
            const storedToken = await this.prisma.refreshToken.findUnique({
                where: { tokenHash },
            });
            if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
                throw new common_1.UnauthorizedException('Invalid or expired refresh token session');
            }
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user || user.status === 'BLOCKED') {
                throw new common_1.UnauthorizedException('User account is invalid or blocked');
            }
            await this.prisma.refreshToken.update({
                where: { id: storedToken.id },
                data: { isRevoked: true },
            });
            return this.generateAndStoreTokens(user.id, user.email, payload.role || 'CUSTOMER');
        }
        catch (err) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
    }
    async logout(refreshToken) {
        if (refreshToken) {
            const tokenHash = this.hashToken(refreshToken);
            await this.prisma.refreshToken.updateMany({
                where: { tokenHash },
                data: { isRevoked: true },
            });
        }
        return { message: 'Logged out successfully. Refresh session invalidated.' };
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
    async generateAndStoreTokens(userId, email, role) {
        const payload = { sub: userId, email, role };
        const accessTokenSecret = this.configService.get('JWT_SECRET', 'super-secret-jwt-key-uniquevastra-2026');
        const accessTokenExpiry = this.configService.get('JWT_ACCESS_EXPIRES_IN', '15m');
        const refreshTokenSecret = this.configService.get('JWT_REFRESH_SECRET', 'super-secret-refresh-key-uniquevastra-2026');
        const refreshTokenExpiry = this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d');
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: accessTokenSecret,
                expiresIn: accessTokenExpiry,
            }),
            this.jwtService.signAsync({ ...payload, jti: crypto.randomUUID() }, {
                secret: refreshTokenSecret,
                expiresIn: refreshTokenExpiry,
            }),
        ]);
        const tokenHash = this.hashToken(refreshToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.prisma.refreshToken.create({
            data: {
                userId,
                tokenHash,
                expiresAt,
            },
        });
        return {
            accessToken,
            refreshToken,
            tokenType: 'Bearer',
            expiresIn: accessTokenExpiry,
        };
    }
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map