import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class BloodInventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    // Get all blood types
    const bloodTypes = await this.prisma.bloodType.findMany();

    // For each blood type, find or on-the-fly initialize the inventory record
    const records = await Promise.all(
      bloodTypes.map(async (bt) => {
        let inv = await this.prisma.bloodInventory.findUnique({
          where: { bloodTypeId: bt.id },
          include: { bloodType: true },
        });

        if (!inv) {
          inv = await this.prisma.bloodInventory.create({
            data: {
              bloodTypeId: bt.id,
              unitsStored: 15, // default seed
              minThreshold: 8,
            },
            include: { bloodType: true },
          });
        }
        return inv;
      }),
    );

    return records;
  }

  async update(dto: UpdateInventoryDto) {
    const bt = await this.prisma.bloodType.findUnique({
      where: { name: dto.bloodType },
    });
    if (!bt) {
      throw new NotFoundException(`Blood type ${dto.bloodType} not found`);
    }

    return this.prisma.bloodInventory.upsert({
      where: { bloodTypeId: bt.id },
      update: {
        unitsStored: dto.unitsStored,
        minThreshold: dto.minThreshold,
      },
      create: {
        bloodTypeId: bt.id,
        unitsStored: dto.unitsStored,
        minThreshold: dto.minThreshold,
      },
      include: { bloodType: true },
    });
  }
}
