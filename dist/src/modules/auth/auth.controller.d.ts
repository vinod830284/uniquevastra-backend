import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            phone: string | null;
            avatarUrl: string | null;
            status: import("@prisma/client").$Enums.UserStatus;
            createdAt: Date;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            tokenType: string;
            expiresIn: string;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            phone: string | null;
            avatarUrl: string | null;
            status: "ACTIVE" | "INACTIVE";
            createdAt: Date;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            tokenType: string;
            expiresIn: string;
        };
    }>;
    refresh(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
        tokenType: string;
        expiresIn: string;
    }>;
    logout(refreshTokenDto?: RefreshTokenDto): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<{
        addresses: {
            id: string;
            name: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.AddressType;
            userId: string;
            isDefault: boolean;
            addressLine1: string;
            addressLine2: string | null;
            city: string;
            state: string;
            postalCode: string;
            country: string;
        }[];
        id: string;
        email: string;
        name: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        avatarUrl: string | null;
        status: import("@prisma/client").$Enums.UserStatus;
    }>;
}
