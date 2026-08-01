import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class BloodTypesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.bloodType.findMany({ orderBy: { name: 'asc' } });
  }

  async findByName(name: string) {
    const bloodType = await this.prisma.bloodType.findUnique({
      where: { name },
    });
    if (!bloodType) {
      throw new NotFoundException(`Blood type "${name}" not found`);
    }
    return bloodType;
  }
}
