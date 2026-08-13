import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly config;
    constructor(prisma: PrismaService, jwtService: JwtService, config: ConfigService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: any;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: any;
        };
    }>;
    refresh(userId: string, presentedRefreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: any;
        };
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<{
        donorProfile: ({
            bloodType: {
                name: string;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            availableStatus: boolean;
            lastDonationDate: Date | null;
            userId: string;
            bloodTypeId: string;
            totalDonations: number;
        }) | null;
        name: string;
        email: string;
        phone: string;
        role: import("@prisma/client").$Enums.Role;
        latitude: number | null;
        longitude: number | null;
        location: string | null;
        id: string;
        isAvailable: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private buildAuthResponse;
}
