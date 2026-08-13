import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
declare const RefreshTokenStrategy_base: new (...args: any[]) => Strategy;
export declare class RefreshTokenStrategy extends RefreshTokenStrategy_base {
    private readonly config;
    constructor(config: ConfigService);
    validate(req: Request, payload: JwtPayload): {
        refreshToken: any;
        sub: string;
        email: string;
        role: import("@prisma/client").Role;
    };
}
export {};
