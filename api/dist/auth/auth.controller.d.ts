import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
            user: {
                id: string;
                name: string;
                email: string;
                role: any;
            };
        };
    }>;
    login(dto: LoginDto): Promise<{
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
            user: {
                id: string;
                name: string;
                email: string;
                role: any;
            };
        };
    }>;
    refresh(req: any, dto: RefreshTokenDto): Promise<{
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
            user: {
                id: string;
                name: string;
                email: string;
                role: any;
            };
        };
    }>;
    logout(user: AuthenticatedUser): Promise<{
        message: string;
        data: {
            message: string;
        };
    }>;
    getProfile(user: AuthenticatedUser): Promise<{
        message: string;
        data: {
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
        };
    }>;
}
