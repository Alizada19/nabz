import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { Role } from '@prisma/client';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;
  let config: any;

  const mockUser = {
    id: 'user-1',
    name: 'Ahmad Zulkifli',
    email: 'ahmad@example.com',
    phone: '+60123456789',
    password: 'hashed-password',
    role: Role.donor,
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

    service = new AuthService(prisma, jwtService, config);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    prisma.user.update.mockResolvedValue({});
  });

  describe('register', () => {
    it('throws ConflictException when email or phone already exists', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);

      await expect(
        service.register({
          name: 'Ahmad',
          email: 'ahmad@example.com',
          phone: '+60123456789',
          password: 'StrongP@ss1',
          role: Role.donor,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('hashes the password and creates the user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.register({
        name: 'Ahmad Zulkifli',
        email: 'ahmad@example.com',
        phone: '+60123456789',
        password: 'StrongP@ss1',
        role: Role.donor,
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('StrongP@ss1', 10);
      expect(result.accessToken).toBe('signed-token');
      expect(result.user.email).toBe('ahmad@example.com');
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'x@x.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password does not match', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: mockUser.email, password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns tokens on successful login', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

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

      await expect(service.refresh('user-1', 'some-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when refresh token does not match', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        refreshToken: 'stored-hash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.refresh('user-1', 'presented-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
