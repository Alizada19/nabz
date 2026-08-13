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
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const auth_service_1 = require("./auth.service");
const client_1 = require("@prisma/client");
jest.mock('bcrypt');
describe('AuthService', () => {
    let service;
    let prisma;
    let jwtService;
    let config;
    const mockUser = {
        id: 'user-1',
        name: 'Ahmad Zulkifli',
        email: 'ahmad@example.com',
        phone: '+60123456789',
        password: 'hashed-password',
        role: client_1.Role.individual,
        refreshToken: null,
    };
    beforeEach(() => {
        prisma = {
            user: {
                findFirst: jest.fn(),
                findUnique: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
            },
        };
        jwtService = { sign: jest.fn().mockReturnValue('signed-token') };
        config = { get: jest.fn().mockReturnValue('config-value') };
        service = new auth_service_1.AuthService(prisma, jwtService, config);
        bcrypt.hash.mockResolvedValue('hashed-password');
        bcrypt.compare.mockResolvedValue(true);
        prisma.user.update.mockResolvedValue({});
    });
    describe('register', () => {
        it('throws ConflictException when email or phone already exists', async () => {
            prisma.user.findFirst.mockResolvedValue(mockUser);
            await expect(service.register({
                name: 'Ahmad',
                email: 'ahmad@example.com',
                phone: '+60123456789',
                password: 'StrongP@ss1',
                role: client_1.Role.individual,
            })).rejects.toThrow(common_1.ConflictException);
        });
        it('hashes the password and creates the user', async () => {
            prisma.user.findFirst.mockResolvedValue(null);
            prisma.user.create.mockResolvedValue(mockUser);
            const result = await service.register({
                name: 'Ahmad Zulkifli',
                email: 'ahmad@example.com',
                phone: '+60123456789',
                password: 'StrongP@ss1',
                role: client_1.Role.individual,
            });
            expect(bcrypt.hash).toHaveBeenCalledWith('StrongP@ss1', 10);
            expect(result.accessToken).toBe('signed-token');
            expect(result.user.email).toBe('ahmad@example.com');
        });
    });
    describe('login', () => {
        it('throws UnauthorizedException when user does not exist', async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            await expect(service.login({ email: 'x@x.com', password: 'wrong' })).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('throws UnauthorizedException when password does not match', async () => {
            prisma.user.findUnique.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);
            await expect(service.login({ email: mockUser.email, password: 'wrong' })).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('returns tokens on successful login', async () => {
            prisma.user.findUnique.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            const result = await service.login({
                email: mockUser.email,
                password: 'correct-password',
            });
            expect(result.accessToken).toBe('signed-token');
            expect(result.refreshToken).toBe('signed-token');
        });
    });
    describe('refresh', () => {
        it('throws UnauthorizedException when no stored refresh token exists', async () => {
            prisma.user.findUnique.mockResolvedValue({ ...mockUser, refreshToken: null });
            await expect(service.refresh('user-1', 'some-token')).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('throws UnauthorizedException when refresh token does not match', async () => {
            prisma.user.findUnique.mockResolvedValue({
                ...mockUser,
                refreshToken: 'stored-hash',
            });
            bcrypt.compare.mockResolvedValue(false);
            await expect(service.refresh('user-1', 'presented-token')).rejects.toThrow(common_1.UnauthorizedException);
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map