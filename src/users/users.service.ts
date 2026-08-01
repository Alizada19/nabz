import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SafeUser } from './interfaces/safe-user.interface';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toSafeUser(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<SafeUser> {
    await this.findById(id); // ensures existence, throws 404 otherwise
    const updated = await this.prisma.user.update({
      where: { id },
      data: dto,
    });
    return this.toSafeUser(updated);
  }

  /**
   * Strips sensitive fields (password, refreshToken) and exact GPS
   * coordinates before returning a user to the client.
   */
  toSafeUser(user: any): SafeUser {
    const { password, refreshToken, latitude, longitude, ...safe } = user;
    return safe;
  }
}
